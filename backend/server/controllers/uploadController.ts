import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import { User, SystemSettings, Course, Department, Schedule } from '../models/index';
import mongoose from 'mongoose';
import { PDFParse } from 'pdf-parse';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
    file?: any;
}

export const uploadSync = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();
        let data: any[] = [];

        if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (fileExt === 'pdf') {
            const parser = new PDFParse({ data: req.file.buffer });

            // Try getTable first (for bordered tables)
            try {
                const tableResult = await (parser as any).getTable();
                if (tableResult.pages && tableResult.pages.length > 0) {
                    for (const page of tableResult.pages) {
                        for (const table of page.tables) {
                            if (table.length > 1) {
                                // Extract headers and rows
                                const headers = table[0].map((h: string) => h.toLowerCase().trim());
                                for (let i = 1; i < table.length; i++) {
                                    const row: any = {};
                                    table[i].forEach((cell: string, idx: number) => {
                                        const header = headers[idx] || `col${idx}`;
                                        row[header] = cell.trim();
                                    });
                                    data.push(row);
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('PDF getTable failed, falling back to text extraction:', err);
            }

            // Fallback: Heuristic parsing from text
            if (data.length === 0) {
                const pdfResult = await parser.getText({ cellSeparator: ' | ' });
                data = parsePdfTabularData(pdfResult.text);
            }
        } else {
            return res.status(400).json({ error: 'Unsupported file format' });
        }

        if (data.length === 0) {
            return res.status(400).json({ error: 'No valid data found in document' });
        }

        let updatedCount = 0;
        let createdCount = 0;

        for (const item of data) {
            // Normalize field names (smart mapping including lowercase variants from table extraction)
            const name = item.Name || item.name || item['student name'] || item['faculty name'] || item['Full Name'];
            const regNo = item['Register Number'] || item['Reg No'] || item['register no'] || item.register_number;
            const facultyId = item['Faculty ID'] || item['ID'] || item['faculty id'] || item.faculty_id;
            const year = item['Year of Study'] || item['Current Year'] || item['year'] || item.year;
            const exp = item['Years of Experience'] || item['Experience'] || item['experience'] || item.experience;
            const email = item.Email || item.email || `${(regNo || facultyId || Math.random().toString(36).substring(7))}@saop.edu`;

            if (regNo) {
                // Student Upsert
                const result = await User.findOneAndUpdate(
                    { register_number: regNo.toString() },
                    {
                        name,
                        email,
                        role: 'Student',
                        year_of_study: year || 1,
                        password: '$2b$10$YourDefaultHashedPassword'
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
                ) as any;
                if (result.lastErrorObject?.updatedExisting) updatedCount++;
                else createdCount++;
            } else if (facultyId) {
                // Faculty Upsert
                const result = await User.findOneAndUpdate(
                    { faculty_id: facultyId.toString() },
                    {
                        name,
                        email,
                        role: 'Faculty',
                        years_of_experience: exp || 0,
                        password: '$2b$10$YourDefaultHashedPassword'
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
                ) as any;
                if (result.lastErrorObject?.updatedExisting) updatedCount++;
                else createdCount++;
            }
        }

        // Sustainability Impact: 5 papers per record updated/created digitally
        const totalImpact = (updatedCount + createdCount) * 5;
        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings();
        settings.papers_saved += totalImpact;
        await settings.save();

        res.json({
            message: 'Data Synchronized Successfully',
            details: {
                totalProcessed: data.length,
                updated: updatedCount,
                created: createdCount,
                papersSaved: totalImpact
            }
        });

    } catch (error: any) {
        console.error('Upload sync error:', error);
        res.status(500).json({ error: 'Failed to process document: ' + error.message });
    }
};

export const uploadCourseSync = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Course upload started...');
        
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Please upload a PDF file for bulk course sync' });
        }

        console.log('PDF file received:', req.file.originalname);

        const parser = new PDFParse({ data: req.file.buffer });
        const pdfResult = await parser.getText({ cellSeparator: ' | ' });

        console.log('PDF text extracted:', pdfResult.text.substring(0, 200) + '...');

        // Enhanced parsing for courses: Name | Code | Credits | Faculty (current format)
        // or: Name | Code | Department | Semester | Credits | Faculty | Type (full format)
        const lines = pdfResult.text.split('\n').filter(l => l.trim().length > 0);
        console.log('Lines found:', lines.length);
        
        let createdCount = 0;
        let updatedCount = 0;

        for (const line of lines) {
            const parts = line.split(/[|,\t]|\s{2,}/).map(p => p.trim()).filter(Boolean);
            console.log('Processing line:', line, 'Parts:', parts);
            
            if (parts.length >= 2) {
                let courseName, courseCode, department, semester, credits, facultyName, courseType;
                
                // Handle current format: Name | Code | Credits | Faculty
                if (parts.length === 4) {
                    courseName = parts[0];
                    courseCode = parts[1];
                    credits = parseInt(parts[2]) || 3;
                    facultyName = parts[3];
                    department = 'Computer Science'; // Default
                    semester = '1'; // Default
                    courseType = 'theory'; // Default
                }
                // Handle full format: Name | Code | Department | Semester | Credits | Faculty | Type
                else if (parts.length >= 6) {
                    courseName = parts[0];
                    courseCode = parts[1];
                    department = parts[2] || 'Computer Science';
                    semester = parts[3] || '1';
                    credits = parseInt(parts[4]) || 3;
                    facultyName = parts[5];
                    courseType = parts[6]?.toLowerCase() === 'lab' ? 'lab' : 'theory';
                }
                // Fallback for minimal format: Name | Code
                else {
                    courseName = parts[0];
                    courseCode = parts[1];
                    credits = 3; // Default
                    facultyName = '';
                    department = 'Computer Science'; // Default
                    semester = '1'; // Default
                    courseType = 'theory'; // Default
                }

                console.log('Course data:', { courseName, courseCode, department, semester, credits, facultyName, courseType });

                // Try to find faculty
                let facultyId = null;
                if (facultyName) {
                    const faculty = await User.findOne({
                        role: 'Faculty',
                        name: { $regex: new RegExp(facultyName, 'i') }
                    });
                    if (faculty) {
                        facultyId = faculty._id;
                        console.log('Found faculty:', faculty.name);
                    } else {
                        console.log('Faculty not found:', facultyName);
                    }
                }

                // Find or create department
                let departmentId = null;
                const dept = await Department.findOne({ 
                    name: { $regex: new RegExp(department, 'i') } 
                });
                if (dept) {
                    departmentId = dept._id;
                    console.log('Found department:', dept.name);
                } else {
                    console.log('Department not found:', department);
                }

                const courseData = {
                    course_name: courseName,
                    course_code: courseCode,
                    department_id: departmentId,
                    semester: semester,
                    credits: credits,
                    faculty_id: facultyId,
                    course_type: courseType,
                    max_students: 100,
                    status: 'active',
                    description: `Course for ${courseName} (${courseCode})`
                };

                console.log('Saving course:', courseData);

                const result = await Course.findOneAndUpdate(
                    { course_code: courseCode },
                    courseData,
                    { upsert: true, new: true, includeResultMetadata: true }
                ) as any;

                console.log('Course save result:', result.lastErrorObject);

                if (result.lastErrorObject?.updatedExisting) {
                    updatedCount++;
                    console.log('Course updated:', courseCode);
                } else {
                    createdCount++;
                    console.log('Course created:', courseCode);
                }
            }
        }

        console.log('Upload complete. Created:', createdCount, 'Updated:', updatedCount);

        // Verify courses were actually saved
        const totalCourses = await Course.countDocuments();
        console.log('Total courses in database after upload:', totalCourses);
        
        const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent courses:', recentCourses.map(c => ({ name: c.course_name, code: c.course_code })));

        res.json({
            message: 'Courses Synchronized Successfully',
            details: {
                totalProcessed: createdCount + updatedCount,
                updated: updatedCount,
                created: createdCount,
                totalCourses: totalCourses,
                format: 'Name | Code | Department | Semester | Credits | Faculty | Type (optional)'
            }
        });

    } catch (error: any) {
        console.error('Course upload sync error:', error);
        res.status(500).json({ error: 'Failed to process course document: ' + error.message });
    }
};

/**
 * Enhanced heuristic-based PDF tabular data parser
 */
function parsePdfTabularData(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const result: any[] = [];

    for (const line of lines) {
        // Split by our custom separator ' | ' or common delimiters
        const parts = line.split(/[|,\t]|\s{2,}/).map(p => p.trim()).filter(Boolean);

        if (parts.length >= 2) {
            // Find a part that looks like an ID
            const idPart = parts.find(p =>
                /^[A-Z]{2,}\d{3,}/.test(p) || // e.g., IT2023001
                /^[A-Z]{2,}-\d+/.test(p) ||   // e.g., ST-123
                /^[A-Z]\d{5,}/.test(p) ||     // e.g., F123456
                /^\d{6,}/.test(p)             // e.g., 2023001
            );

            if (idPart) {
                const name = parts[0];
                const info = parts[2] || '';

                if (idPart.startsWith('FAC') || idPart.includes('F-') || info.toLowerCase().includes('faculty')) {
                    result.push({
                        name,
                        faculty_id: idPart,
                        experience: parseInt(info) || 0
                    });
                } else {
                    result.push({
                        name,
                        register_number: idPart,
                        year_of_study: parseInt(info) || 1
                    });
                }
            }
        }
    }
    return result;
}

export const uploadTimetableSync = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Please upload a PDF file for timetable generation' });
        }

        const { department_id, semester, academic_year } = req.body;
        
        const parser = new PDFParse({ data: req.file.buffer });
        const pdfResult = await parser.getText({ cellSeparator: ' | ' });

        // Parse timetable data: Faculty | Day | Time | Course | Location
        const lines = pdfResult.text.split('\n').filter(l => l.trim().length > 0);
        let createdCount = 0;

        // Clear existing schedules for fresh generation
        await Schedule.deleteMany({});

        for (const line of lines) {
            const parts = line.split(/[|,\t]|\s{2,}/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 4) {
                const facultyName = parts[0];
                const day = parts[1];
                const timeSlot = parts[2];
                const courseName = parts[3];
                const location = parts[4] || 'TBA';

                // Find faculty
                const faculty = await User.findOne({
                    role: 'Faculty',
                    name: { $regex: new RegExp(facultyName, 'i') }
                });

                // Find course
                const course = await Course.findOne({
                    course_name: { $regex: new RegExp(courseName, 'i') }
                });

                if (faculty && course) {
                    const [startTime, endTime] = timeSlot.includes('-') 
                        ? timeSlot.split('-').map(t => t.trim())
                        : [timeSlot, timeSlot];

                    const schedule = new Schedule({
                        course_id: course._id,
                        faculty_id: faculty._id,
                        event_type: 'class',
                        event_name: `${course.course_name} - ${faculty.name}`,
                        day_of_week: day,
                        start_time: startTime,
                        end_time: endTime,
                        location: location,
                        department_id: department_id || null,
                        semester: semester || null,
                        academic_year: academic_year || null
                    });

                    await schedule.save();
                    createdCount++;
                }
            }
        }

        res.json({
            message: 'Faculty timetables generated successfully',
            details: {
                totalSchedules: createdCount,
                processedLines: lines.length,
                department: department_id,
                semester: semester,
                academic_year: academic_year
            }
        });

    } catch (error: any) {
        console.error('Timetable upload sync error:', error);
        res.status(500).json({ error: 'Failed to process timetable document: ' + error.message });
    }
};

export const downloadTemplate = async (req: Request, res: Response) => {
    const templateData = [
        { 'Name': 'Sample Student', 'Register Number': 'REG001', 'Year of Study': '2', 'Email': 'student@sample.com' },
        { 'Name': 'Sample Faculty', 'Faculty ID': 'FAC001', 'Years of Experience': '5', 'Email': 'faculty@sample.com' }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(templateData);
    xlsx.utils.book_append_sheet(wb, ws, 'Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=SAOP_User_Import_Template.xlsx');
    res.send(buffer);
};
