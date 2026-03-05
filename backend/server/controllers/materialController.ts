import { Response } from 'express';
import { Material } from '../models';
import { AuthRequest } from '../middleware/auth';

// Step 3: Faculty uploads material
export const uploadMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { course_id, title, description, authorized_emails } = req.body;

        // req.file would be available from multer middleware
        const reqAny = req as any;
        const filePath = reqAny.file ? reqAny.file.path : req.body.file_path;
        const fileType = reqAny.file ? reqAny.file.mimetype : req.body.file_type;
        const fileSize = reqAny.file ? `${(reqAny.file.size / 1024 / 1024).toFixed(2)} MB` : req.body.file_size;

        if (!course_id || !title || !filePath) {
            return res.status(400).json({ error: 'Course ID, title, and file are required' });
        }

        const material = new Material({
            course_id,
            title,
            description,
            file_path: filePath,
            file_type: fileType,
            file_size: fileSize,
            authorized_emails: authorized_emails ? (typeof authorized_emails === 'string' ? JSON.parse(authorized_emails) : authorized_emails) : [],
            uploaded_by: req.user?.id
        });

        await material.save();

        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            material
        });
    } catch (error) {
        console.error('Upload material error:', error);
        res.status(500).json({ error: 'Failed to upload material' });
    }
};

export const getMaterials = async (req: AuthRequest, res: Response) => {
    try {
        // Basic logic for fetching materials
        const materials = await Material.find().populate('course_id', 'course_name');
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};
