import { Response } from 'express';
import { Schedule } from '../models';
import { AuthRequest } from '../middleware/auth';

// Step 4: Admin creates schedule
export const createSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { course_id, event_type, event_name, day_of_week, start_time, end_time, location, event_date } = req.body;

        if (!course_id || !event_type || !event_name) {
            return res.status(400).json({ error: 'Course ID, event type, and event name are required' });
        }

        const schedule = new Schedule({
            course_id,
            event_type,
            event_name,
            day_of_week,
            start_time,
            end_time,
            location,
            event_date
        });

        await schedule.save();

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            schedule
        });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
};

export const getSchedules = async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await Schedule.find().populate('course_id', 'course_name course_code');
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};
