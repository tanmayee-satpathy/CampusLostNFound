import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// 👇 FORCE dotenv to read from ROOT .env
dotenv.config({ path: process.cwd() + "/.env" });

const uri = process.env.MONGODB_URI;

console.log("✅ Loaded MONGODB_URI:", uri); // TEMP DEBUG

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const client = new MongoClient(uri);

let db;

export async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("lostnfound");
    console.log("✅ MongoDB connected");
  }
  return db;
}
