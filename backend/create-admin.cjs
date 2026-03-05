// Simple script to create admin user
const { MongoClient } = require('mongodb');

async function createAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saop';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Check if admin exists
    const existingAdmin = await users.findOne({ email: 'admin@saop.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('ID (use as password):', existingAdmin._id.toString());
      console.log('Name:', existingAdmin.first_name, existingAdmin.last_name);
      return;
    }
    
    // Create admin user
    const adminUser = {
      email: 'admin@saop.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'admin123' hashed
      first_name: 'System',
      last_name: 'Administrator',
      role: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await users.insertOne(adminUser);
    console.log('Admin user created successfully!');
    console.log('Email: admin@saop.com');
    console.log('Password (MongoDB ID):', result.insertedId.toString());
    console.log('Name: System Administrator');
    console.log('\nLogin Instructions:');
    console.log('1. Go to login page');
    console.log('2. Select "Administrator" role');
    console.log('3. Email: admin@saop.com');
    console.log('4. Password:', result.insertedId.toString());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createAdmin();
