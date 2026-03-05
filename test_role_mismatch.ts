import { createServer } from './server';
import axios from 'axios';
import mongoose from 'mongoose';

async function testRoleMismatch() {
    const app = createServer();
    const PORT = 4007;
    const server = app.listen(PORT, async () => {
        console.log(`Diagnostic server running on port ${PORT}`);

        try {
            console.log('Testing role mismatch for faculty@saop.com (registered as Faculty)...');

            // Attempt login as Admin for a Faculty account
            try {
                await axios.post(`http://localhost:${PORT}/api/auth/login`, {
                    email: 'faculty@saop.com',
                    password: 'faculty123',
                    role: 'Admin'
                });
                console.log('❌ Error: Login should have failed but succeeded.');
            } catch (error: any) {
                if (error.response?.status === 403) {
                    console.log('✅ Success: Received expected 403 status.');
                    console.log('Error Data:', error.response.data);
                    if (error.response.data.error === 'Academic Role Mismatch') {
                        console.log('✅ Success: Received "Academic Role Mismatch" error.');
                    } else {
                        console.log('❌ Error: Unexpected error message:', error.response.data.error);
                    }
                } else {
                    console.log('❌ Error: Received unexpected status:', error.response?.status);
                }
            }

            console.log('\nTesting correct login for faculty@saop.com (Faculty)...');
            const loginRes = await axios.post(`http://localhost:${PORT}/api/auth/login`, {
                email: 'faculty@saop.com',
                password: 'faculty123',
                role: 'Faculty'
            });
            console.log('✅ Success: Login successful with correct role.');

        } catch (error: any) {
            console.log('❌ Unexpected error:', error.message);
        } finally {
            server.close();
            await mongoose.disconnect();
            process.exit(0);
        }
    });
}

testRoleMismatch();
