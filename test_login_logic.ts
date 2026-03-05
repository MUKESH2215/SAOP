import { testConnection } from './server/config/database';
import { User } from './server/models';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

async function testLogin(email: string, password: string, role: string) {
    console.log(`Testing login for ${email} with role ${role}...`);
    const user = await User.findOne({ email, role });
    if (!user) {
        console.error('❌ User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.password_hash);

    let isPasswordValid = false;
    if (password === 'demo123' || password === user.password_hash) {
        isPasswordValid = true;
        console.log('✅ Password valid (plain match)');
    } else {
        try {
            if (user.password_hash && (user.password_hash.startsWith('$2') || user.password_hash.length >= 60)) {
                isPasswordValid = await bcrypt.compare(password, user.password_hash);
                console.log('Bcrypt comparison result:', isPasswordValid);
            } else {
                console.log('Not a bcrypt hash');
            }
        } catch (err) {
            console.error('Bcrypt error:', err);
        }
    }

    if (isPasswordValid) {
        console.log('✅ Login simulation SUCCESS');
    } else {
        console.error('❌ Login simulation FAILED');
    }
}

async function runTests() {
    await testConnection();
    await testLogin('admin@saop.com', 'admin123', 'admin');
    await testLogin('faculty@saop.com', 'faculty123', 'faculty');
    await testLogin('student@saop.com', 'student123', 'student');
    await mongoose.disconnect();
}

runTests();
