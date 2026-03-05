import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saop';

// Database connection helper
export const testConnection = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return false;
  }
};

// We don't need a "query" helper anymore because we'll use Mongoose models.
// But I'll keep an empty export for now to avoid breaking imports during migration.
export const query = async (sql: string, params?: any[]) => {
  console.warn('⚠️ SQL query called during MongoDB migration. This logic should be refactored.');
  return [];
};

export default mongoose.connection;