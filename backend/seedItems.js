const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { getDb } = require("./config/db");
const { ObjectId } = require("mongodb");

async function seedItems() {
  try {
    const db = await getDb();
    const itemsCollection = db.collection("Items");
    const usersCollection = db.collection("Users");

    // Check if there are any users, if not, create a sample user first
    let sampleUserId;
    const existingUsers = await usersCollection.find({}).limit(1).toArray();
    
    if (existingUsers.length > 0) {
      sampleUserId = existingUsers[0]._id.toString();
    } else {
      // Create a sample user for the items
      const sampleUser = {
        nuid: "N00123456",
        name: "John Doe",
        phone: "+1 (617) 555-0123",
        email: "john.doe@northeastern.edu",
        passwordHash: "$2a$10$dummyhashforseeding", // Dummy hash
        createdAt: new Date(),
      };
      const userResult = await usersCollection.insertOne(sampleUser);
      sampleUserId = userResult.insertedId.toString();
      console.log("Created sample user for seeding items");
    }

    // Sample items with all required fields
    const sampleItems = [
      {
        userId: sampleUserId,
        name: "Black Leather Wallet",
        location: "Snell Library",
        description: "A black leather wallet containing ID and credit cards. Found on the third floor near the study area.",
        dateFound: "2024-11-01",
        category: "Accessories",
        image: null,
        status: "searching",
        createdAt: new Date("2024-11-01T10:30:00Z"),
        updatedAt: new Date("2024-11-01T10:30:00Z"),
      },
      {
        userId: sampleUserId,
        name: "White Apple AirPods",
        location: "Curry Student Center",
        description: "White Apple AirPods found near the food court. Case is slightly scratched but AirPods are in good condition.",
        dateFound: "2024-10-30",
        category: "Electronics",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-30T15:45:00Z"),
        updatedAt: new Date("2024-10-30T15:45:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Blue Backpack",
        location: "Churchill Hall",
        description: "Blue backpack with textbooks and notebooks inside. Has a Northeastern logo patch on the front pocket.",
        dateFound: "2024-10-29",
        category: "Bags",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-29T09:20:00Z"),
        updatedAt: new Date("2024-10-29T09:20:00Z"),
      },
      {
        userId: sampleUserId,
        name: "iPhone 13 Pro",
        location: "Marino Recreation Center",
        description: "iPhone 13 Pro in a black case. Screen is in perfect condition. Found in the locker room area.",
        dateFound: "2024-10-28",
        category: "Electronics",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-28T14:15:00Z"),
        updatedAt: new Date("2024-10-28T14:15:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Northeastern University Hoodie",
        location: "Krentzman Quad",
        description: "Red Northeastern University hoodie, size Large. Found on a bench near the main entrance.",
        dateFound: "2024-10-27",
        category: "Clothing",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-27T11:00:00Z"),
        updatedAt: new Date("2024-10-27T11:00:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Calculus Textbook",
        location: "Snell Library",
        description: "Calculus: Early Transcendentals textbook, 8th edition. Found on a study desk on the second floor.",
        dateFound: "2024-10-26",
        category: "Books",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-26T16:30:00Z"),
        updatedAt: new Date("2024-10-26T16:30:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Car Keys with Keychain",
        location: "West Village Parking Garage",
        description: "Set of car keys with a red keychain. Found on the ground near the entrance.",
        dateFound: "2024-10-25",
        category: "Keys",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-25T08:45:00Z"),
        updatedAt: new Date("2024-10-25T08:45:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Silver Watch",
        location: "Curry Student Center",
        description: "Silver wristwatch with leather strap. Brand appears to be Fossil. Found in the restroom area.",
        dateFound: "2024-10-24",
        category: "Accessories",
        image: null,
        status: "claimed",
        createdAt: new Date("2024-10-24T13:20:00Z"),
        updatedAt: new Date("2024-10-24T13:20:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Laptop Charger",
        location: "Snell Library",
        description: "MacBook Pro charger, 87W MagSafe 2. Found plugged into a wall outlet on the first floor.",
        dateFound: "2024-10-23",
        category: "Electronics",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-23T10:10:00Z"),
        updatedAt: new Date("2024-10-23T10:10:00Z"),
      },
      {
        userId: sampleUserId,
        name: "Water Bottle",
        location: "Marino Recreation Center",
        description: "Stainless steel water bottle with Northeastern logo. Found in the gym area near the treadmills.",
        dateFound: "2024-10-22",
        category: "Other",
        image: null,
        status: "searching",
        createdAt: new Date("2024-10-22T18:00:00Z"),
        updatedAt: new Date("2024-10-22T18:00:00Z"),
      },
    ];

    // Check if items already exist
    const existingItems = await itemsCollection.countDocuments();
    if (existingItems > 0) {
      console.log(`Items collection already has ${existingItems} items.`);
      console.log("Would you like to add more items? (This script will add items regardless)");
    }

    // Insert sample items
    const result = await itemsCollection.insertMany(sampleItems);
    console.log(`Successfully inserted ${result.insertedCount} sample items into the Items collection.`);
    console.log("\nSample items added:");
    sampleItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.location} (${item.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding items:", error);
    process.exit(1);
  }
}

seedItems();

