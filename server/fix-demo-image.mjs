import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();

  const db = client.db(process.env.DB_NAME || "studiospace");

  const result = await db.collection("studios").updateOne(
    { title: "The Creator Hub (Demo)" },
    {
      $set: {
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
        updatedAt: new Date(),
      },
    }
  );

  console.log("Updated:", result.modifiedCount);
} finally {
  await client.close();
}
