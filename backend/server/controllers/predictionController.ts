import { Response } from 'express';
import { Prediction } from '../models';
import { AuthRequest } from '../middleware/auth';

// Step 5: Prediction generated
export const storePrediction = async (req: AuthRequest, res: Response) => {
    try {
        const { student_id, course_id, predicted_result, risk_level, confidence_score, improvement_suggestions } = req.body;

        if (!student_id || !predicted_result || !risk_level) {
            return res.status(400).json({ error: 'Student ID, predicted result, and risk level are required' });
        }

        const prediction = new Prediction({
            student_id,
            course_id,
            predicted_result,
            risk_level,
            confidence_score,
            improvement_suggestions,
            analysis_date: new Date()
        });

        await prediction.save();

        res.status(201).json({
            success: true,
            message: 'Prediction stored successfully',
            prediction
        });
    } catch (error) {
        console.error('Store prediction error:', error);
        res.status(500).json({ error: 'Failed to store prediction' });
    }
};

export const getPredictions = async (req: AuthRequest, res: Response) => {
    try {
        const predictions = await Prediction.find().populate('student_id', 'name email').populate('course_id', 'course_name');
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
};
