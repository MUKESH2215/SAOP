import { testConnection } from './server/config/database';
import { User, Course } from './server/models';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

async function verify() {
    console.log('Testing MongoDB connection...');
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Failed to connect to MongoDB. Check if MongoDB is running.');
        process.exit(1);
    }

    try {
        console.log('Seeding initial test users (Capitalized Roles & New Schema)...');

        // Clear existing users to avoid conflicts during refactor verification
        await User.deleteMany({});
        console.log('Cleared existing users.');

        const testUsers = [
            { email: 'admin@saop.com', password: 'admin123', name: 'System Administrator', role: 'Admin' },
            { email: 'faculty@saop.com', password: 'faculty123', name: 'John Doe', role: 'Faculty' },
            { email: 'student@saop.com', password: 'student123', name: 'Jane Smith', role: 'Student' },
            { email: 'mukeshkanna.it23@bitsathy.ac.in', password: 'admin123', name: 'Mukesh Kanna', role: 'Admin' }
        ];

        for (const u of testUsers) {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await User.create({
                ...u,
                password: hashedPassword
            });
        }

        console.log('✅ Test users seeded.');

        const userCount = await User.countDocuments();
        console.log(`Total users in MongoDB: ${userCount}`);

        console.log('✅ MongoDB verification and re-seeding successful.');
    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verify();
