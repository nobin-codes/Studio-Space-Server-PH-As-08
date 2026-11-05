
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "studiospace";

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables");
}

const client = new MongoClient(uri);
const database: Db = client.db(dbName);

let connectionPromise: Promise<void> | null = null;

export const connectDB = async (): Promise<Db> => {
  if (!connectionPromise) {
    connectionPromise = client.connect().then(async () => {
      await database.command({ ping: 1 });
      console.log("MongoDB connected successfully!");
    });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  return database;
};

export const getDB = (): Db => {
  return database;
};
