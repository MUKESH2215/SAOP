import axios from 'axios';

async function testAdminStatsApi() {
    const adminCredentials = {
        email: 'mukeshkanna.it23@bitsathy.ac.in',
        password: 'admin123',
        role: 'admin'
    };

    try {
        console.log('Logging in to get token...');
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', adminCredentials);
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        console.log('Fetching admin stats from API...');
        const statsRes = await axios.get('http://localhost:4000/api/admin/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Stats:', statsRes.data);
        console.log('✅ Admin stats API test successful!');
    } catch (error: any) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

testAdminStatsApi();
