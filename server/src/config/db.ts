import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "studiospace";

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables");
}

const client = new MongoClient(uri);

let database: Db;

export const connectDB = async (): Promise<Db> => {
  await client.connect();

  database = client.db(dbName);

  await database.command({ ping: 1 });

  console.log("MongoDB connected successfully!");

  return database;
};

export const getDB = (): Db => {
  if (!database) {
    throw new Error("Database is not connected yet");
  }

  return database;
};