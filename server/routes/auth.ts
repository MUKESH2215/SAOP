import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { generateToken } from '../middleware/auth';

const router = Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: 'Email, password, and role are required' 
      });
    }

    // Query user from database
    const users: any = await query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // For demo purposes, accept "demo123" as password
    // In production, always use bcrypt.compare
    const isPasswordValid = password === 'demo123' || 
      await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        profileImage: user.profile_image
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint (for admin to create users)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUsers: any = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const result: any = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({ 
      success: true, 
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;