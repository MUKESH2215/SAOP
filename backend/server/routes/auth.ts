import { Router } from 'express';
import { login, register, verifyToken } from '../controllers/authController';

const router = Router();

// Admin seed route (for testing only)
router.post('/seed-admin', async (req, res) => {
    try {
        const { User } = require('../models');
        const bcrypt = require('bcrypt');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@saop.com' });
        if (existingAdmin) {
            return res.json({
                success: true,
                message: 'Admin user already exists',
                admin: {
                    email: existingAdmin.email,
                    id: existingAdmin._id.toString(),
                    name: `${existingAdmin.first_name} ${existingAdmin.last_name}`,
                    loginInstructions: {
                        email: 'admin@saop.com',
                        password: existingAdmin._id.toString(),
                        role: 'Admin'
                    }
                }
            });
        }

        // Create admin user
        const passwordHash = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            email: 'admin@saop.com',
            password: passwordHash,
            first_name: 'System',
            last_name: 'Administrator',
            role: 'Admin'
        });

        await adminUser.save();

        res.json({
            success: true,
            message: 'Admin user created successfully',
            admin: {
                email: adminUser.email,
                id: adminUser._id.toString(),
                name: `${adminUser.first_name} ${adminUser.last_name}`,
                loginInstructions: {
                    email: 'admin@saop.com',
                    password: adminUser._id.toString(),
                    role: 'Admin'
                }
            }
        });
    } catch (error) {
        console.error('Seed admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
router.post('/login', login);

// Register endpoint
router.post('/register', register);

// Verify token endpoint
router.get('/verify', verifyToken);

export default router;