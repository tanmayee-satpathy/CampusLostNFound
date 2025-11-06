const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { getDb } = require("./config/db");
const { ObjectId } = require("mongodb");

async function seedNotifications() {
  try {
    const db = await getDb();
    const notificationsCollection = db.collection("Notifications");
    const usersCollection = db.collection("Users");
    const itemsCollection = db.collection("Items");

    // Get all users and items
    const users = await usersCollection.find({}).toArray();
    const items = await itemsCollection.find({}).toArray();

    if (users.length === 0) {
      console.error("No users found. Please create users first.");
      process.exit(1);
    }

    if (items.length === 0) {
      console.error("No items found. Please create items first.");
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${items.length} items.`);

    // Clear existing notifications (optional - comment out if you want to keep existing ones)
    const existingCount = await notificationsCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing notifications. Clearing them...`);
      await notificationsCollection.deleteMany({});
    }

    const sampleNotifications = [];

    // Create "new item" notifications
    // For each item, create notifications for all users except the item owner
    items.forEach((item, itemIndex) => {
      const itemOwnerId = item.userId.toString();
      
      // Get all users except the item owner
      const recipients = users.filter(
        (user) => user._id.toString() !== itemOwnerId
      );

      recipients.forEach((user, userIndex) => {
        // Create notification with varying timestamps (more recent items have more recent notifications)
        const daysAgo = itemIndex % 7; // Spread over last 7 days
        const hoursAgo = userIndex % 24; // Spread over last 24 hours
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        createdAt.setHours(createdAt.getHours() - hoursAgo);
        createdAt.setMinutes(createdAt.getMinutes() - (userIndex % 60));

        // Some notifications are read, some are unread
        const isRead = Math.random() > 0.4; // 60% chance of being read

        sampleNotifications.push({
          userId: user._id.toString(),
          itemId: item._id.toString(),
          itemName: item.name,
          itemLocation: item.location,
          itemImage: item.image,
          itemCategory: item.category,
          dateFound: item.dateFound,
          type: "new", // New item notification
          read: isRead,
          createdAt: createdAt,
          readAt: isRead ? new Date(createdAt.getTime() + Math.random() * 3600000) : null, // Read within 1 hour if read
        });
      });
    });

    // Create "claimed" notifications
    // For some items, create claim notifications for the item owner
    const claimedItems = items.filter((item) => item.status === "claimed");
    const itemsToClaim = items
      .filter((item) => item.status === "searching")
      .slice(0, Math.min(3, items.length)); // Claim up to 3 items

    [...claimedItems, ...itemsToClaim].forEach((item, index) => {
      const itemOwnerId = item.userId.toString();
      const itemOwner = users.find((u) => u._id.toString() === itemOwnerId);

      if (itemOwner) {
        // Create claim notification with timestamp after item creation
        const createdAt = new Date(item.createdAt);
        createdAt.setDate(createdAt.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days after item creation
        createdAt.setHours(createdAt.getHours() + Math.floor(Math.random() * 12) + 9); // Between 9 AM and 9 PM

        // Some claim notifications are read, some are unread
        const isRead = Math.random() > 0.3; // 70% chance of being read

        sampleNotifications.push({
          userId: itemOwnerId,
          itemId: item._id.toString(),
          itemName: item.name,
          itemLocation: item.location,
          itemImage: item.image,
          itemCategory: item.category,
          dateFound: item.dateFound,
          type: "claimed", // Claim notification
          read: isRead,
          createdAt: createdAt,
          readAt: isRead ? new Date(createdAt.getTime() + Math.random() * 7200000) : null, // Read within 2 hours if read
        });
      }
    });

    // Insert notifications in batches to avoid overwhelming the database
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < sampleNotifications.length; i += batchSize) {
      const batch = sampleNotifications.slice(i, i + batchSize);
      const result = await notificationsCollection.insertMany(batch);
      insertedCount += result.insertedCount;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.insertedCount} notifications`);
    }

    console.log(`\nSuccessfully inserted ${insertedCount} sample notifications into the Notifications collection.`);

    // Summary statistics
    const newItemCount = sampleNotifications.filter((n) => n.type === "new").length;
    const claimedCount = sampleNotifications.filter((n) => n.type === "claimed").length;
    const readCount = sampleNotifications.filter((n) => n.read).length;
    const unreadCount = sampleNotifications.filter((n) => !n.read).length;

    console.log("\nNotification Summary:");
    console.log(`- New item notifications: ${newItemCount}`);
    console.log(`- Claim notifications: ${claimedCount}`);
    console.log(`- Read notifications: ${readCount}`);
    console.log(`- Unread notifications: ${unreadCount}`);

    // Show notifications per user
    const notificationsPerUser = {};
    sampleNotifications.forEach((notif) => {
      if (!notificationsPerUser[notif.userId]) {
        notificationsPerUser[notif.userId] = 0;
      }
      notificationsPerUser[notif.userId]++;
    });

    console.log("\nNotifications per user:");
    Object.entries(notificationsPerUser).forEach(([userId, count]) => {
      const user = users.find((u) => u._id.toString() === userId);
      const userName = user ? user.name : "Unknown";
      console.log(`- ${userName}: ${count} notifications`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding notifications:", error);
    process.exit(1);
  }
}

seedNotifications();

