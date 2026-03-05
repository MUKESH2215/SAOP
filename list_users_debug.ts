import { testConnection } from './server/config/database';
import { User } from './server/models';
import mongoose from 'mongoose';

async function listUsers() {
    await testConnection();
    try {
        const users = await User.find({}, 'email name role');
        console.log('Users in DB:');
        console.table(users.map(u => ({
            email: u.email,
            name: u.name,
            role: u.role
        })));
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
