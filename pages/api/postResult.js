import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_ENV_MONGODB_URI;
const dbName = "entities";
const collectionName = "AiTestingData";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return cachedClient;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const document = {
      date: new Date(),
      data,
    };
    console.log("going to insert the data");
    const result = await collection.insertOne(document);

    res.status(201).json({ message: "Data inserted successfully", result });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
