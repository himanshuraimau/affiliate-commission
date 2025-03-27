import mongoose from "mongoose"

declare global {
  var mongoose: { conn: any; promise: any } | undefined
}

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// Define interface for cached type
interface MongooseCache {
  conn: any;
  promise: any;
}

// Initialize with proper typing
let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

// Set global.mongoose if it wasn't already set
if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Export the same function with the name expected by other modules
export const connectToDatabase = connectDB;

