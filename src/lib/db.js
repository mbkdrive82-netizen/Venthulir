import mongoose from 'mongoose';
import dns from 'dns';

try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn('WARNING: MONGO_URI environment variable is missing.');
}

/**
 * Global is used here to maintain a cached connection across hot-reloads in development.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log('🌿 Royal Venthulir Database Connected');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('❌ Database Connection Error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
