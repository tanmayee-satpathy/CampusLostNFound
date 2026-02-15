import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || "campusLostFound");
    console.log("MongoDB connected to", db.databaseName);
  }
  return db;
}
