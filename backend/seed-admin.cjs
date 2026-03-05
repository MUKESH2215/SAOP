const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import User model directly
const User = require('./server/models/index.js').User;

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saop');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@saop.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('ID (use as password):', existingAdmin._id.toString());
      console.log('Name:', existingAdmin.first_name, existingAdmin.last_name);
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      email: 'admin@saop.com',
      password: passwordHash,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'Admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@saop.com');
    console.log('Password (MongoDB ID):', adminUser._id.toString());
    console.log('Name: System Administrator');
    console.log('\nLogin Instructions:');
    console.log('1. Go to the login page');
    console.log('2. Select "Administrator" role');
    console.log('3. Email: admin@saop.com');
    console.log('4. Password:', adminUser._id.toString());

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
