import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db(process.env.DB_NAME || "studiospace");

  const studio = await db.collection("studios").findOne(
    {},
    { sort: { createdAt: -1 } }
  );

  console.log("Database:", db.databaseName);
  console.log("Existing studios:", await db.collection("studios").countDocuments());
  console.log("Owner details:", studio ? {
    ownerId: studio.ownerId,
    ownerEmail: studio.ownerEmail,
    hostName: studio.hostName
  } : "No existing studio found");
} finally {
  await client.close();
}
