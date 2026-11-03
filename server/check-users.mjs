import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db(process.env.DB_NAME || "studiospace");

  const users = await db.collection("user").find(
    {},
    { projection: { _id: 1, id: 1, name: 1, email: 1 } }
  ).toArray();

  console.log("Registered accounts:", users);
} finally {
  await client.close();
}
