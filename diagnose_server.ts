import { createServer } from './server';
import axios from 'axios';
import mongoose from 'mongoose';

async function diagnose() {
    const app = createServer();
    const PORT = 4005; // Use a different port to avoid conflicts
    const server = app.listen(PORT, async () => {
        console.log(`Diagnostic server running on port ${PORT}`);

        try {
            // 1. Login
            const loginRes = await axios.post(`http://localhost:${PORT}/api/auth/login`, {
                email: 'mukeshkanna.it23@bitsathy.ac.in',
                password: 'admin123',
                role: 'admin'
            });
            const token = loginRes.data.token;
            console.log('Login successful');

            // 2. Fetch stats
            console.log('Requesting /api/admin/stats...');
            const statsRes = await axios.get(`http://localhost:${PORT}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Result:', statsRes.data);
        } catch (error: any) {
            if (error.response) {
                console.log('API responded with error:', error.response.status, error.response.data);
            } else {
                console.log('Request failed:', error.message);
            }
        } finally {
            server.close();
            await mongoose.disconnect();
            process.exit(0);
        }
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
    });
}

diagnose();
