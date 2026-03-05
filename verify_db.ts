import { testConnection, query } from './server/config/database';

async function verify() {
    console.log('Testing connection...');
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Failed to connect to database. Check if MySQL is running and credentials in .env are correct.');
        process.exit(1);
    }

    try {
        console.log('Checking for users table...');
        const tables: any = await query('SHOW TABLES LIKE "users"');
        if (tables.length === 0) {
            console.error('❌ Table "users" does not exist. You may need to run the database setup script.');
            process.exit(1);
        }

        console.log('Checking for test users...');
        const users: any = await query('SELECT email, role FROM users');
        console.log('Users in database:', users);

        if (users.length === 0) {
            console.error('⚠️ No users found in database.');
        } else {
            console.log('✅ Database verification successful.');
        }
    } catch (error) {
        console.error('❌ Error during verification:', error);
        process.exit(1);
    }
    process.exit(0);
}

verify();
