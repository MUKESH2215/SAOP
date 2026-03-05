import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saop';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return false;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await mongoose.connect(mongoUri);
    console.log('✅ Database connection test successful');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export default mongoose;