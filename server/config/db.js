import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose.
 * Reads MONGO_URI from environment variables (.env file).
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MONGO_URI is missing in .env environment variables!');
    return false;
  }
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout for remote cloud Atlas connection
    });
    console.log(`✅ MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}, DB Name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failure: ${error.message}`);
    return false;
  }
};

