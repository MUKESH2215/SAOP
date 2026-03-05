import { testConnection } from './server/config/database';
import { User } from './server/models';
import mongoose from 'mongoose';

async function listUsers() {
    await testConnection();
    const users = await User.find({});
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
        console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.password_hash}`);
    });
    console.log('-------------------------');
    await mongoose.disconnect();
}

listUsers();
