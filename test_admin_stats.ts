import { testConnection } from './server/config/database';
import { User, Course, Enrollment, Assignment, Submission } from './server/models';
import mongoose from 'mongoose';

async function testAdminStats() {
    console.log('Testing admin stats logic...');
    await testConnection();
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const activeCourses = await Course.countDocuments({ status: 'active' });

        console.log('Stats:', {
            totalStudents,
            totalFaculty,
            activeCourses,
            papersSaved: 45200
        });
        console.log('✅ Admin stats logic works!');
    } catch (error) {
        console.error('❌ Admin stats logic failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testAdminStats();
