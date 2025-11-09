const express = require("express");
const router = express.Router();
const fs = require("fs");
const { getDb } = require("../config/db");
const { ObjectId } = require("mongodb");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");

// GET /api/items - Get all items with optional search and filters with pagination
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      location,
      category,
      dateFound,
      userId,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    // Build query filter
    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.location = location;
    }

    if (category) {
      filter.category = category;
    }

    if (dateFound) {
      filter.dateFound = dateFound;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalCount = await itemsCollection.countDocuments(filter);

    // Get paginated items
    const items = await itemsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:id - Get a single item by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/items - Create a new item (requires authentication)
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { name, location, description, dateFound, category, status } =
        req.body;

      if (!name || !location || !description || !dateFound || !category) {
        // If file was uploaded but validation failed, delete it
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }
        return res.status(400).json({ message: "Missing required fields." });
      }

      const db = await getDb();
      const itemsCollection = db.collection("Items");

      // Get image path if file was uploaded
      let imagePath = null;
      if (req.file) {
        // Store relative path from backend/uploads
        imagePath = `/uploads/${req.file.filename}`;
      }

      // Use userId from authenticated user (req.userId is set by authenticate middleware)
      const newItem = {
        userId: req.userId,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        dateFound,
        category: category.trim(),
        image: imagePath,
        status: status || "searching", // "searching" or "claimed"
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      const itemId = result.insertedId.toString();

      // Create notifications for all users except the one who posted the item
      try {
        const usersCollection = db.collection("Users");
        const notificationsCollection = db.collection("Notifications");

        // Get all users except the one who posted
        const users = await usersCollection
          .find({ _id: { $ne: new ObjectId(req.userId) } })
          .toArray();

        if (users.length > 0) {
          // Create notifications for all users
          const notifications = users.map((user) => ({
            userId: user._id.toString(),
            itemId: itemId,
            itemName: newItem.name,
            itemLocation: newItem.location,
            itemImage: newItem.image,
            itemCategory: newItem.category,
            dateFound: newItem.dateFound,
            type: "new", // New item notification
            read: false,
            createdAt: new Date(),
          }));

          await notificationsCollection.insertMany(notifications);
          console.log(
            `Created ${notifications.length} notifications for new item: ${itemId}`
          );
        }
      } catch (notificationError) {
        // Log error but don't fail the item creation
        console.error("Error creating notifications:", notificationError);
      }

      res.status(201).json({
        message: "Item created successfully.",
        itemId: result.insertedId,
        item: { ...newItem, _id: result.insertedId },
      });
    } catch (error) {
      // If file was uploaded but error occurred, delete it
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }
      next(error);
    }
  }
);

// PUT /api/items/:id - Update an item (requires authentication - can only update own items)
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, description, dateFound, category, image, status } =
      req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    // Check if item exists
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Check if user is updating status to "claimed" - allow anyone to claim items
    // Otherwise, only owner can update their own items
    const isClaimingItem = status === "claimed" && item.status !== "claimed";
    const isOwner = item.userId === req.userId;

    if (!isClaimingItem && !isOwner) {
      return res
        .status(403)
        .json({ message: "You can only update your own items." });
    }

    // If someone is claiming an item (not the owner), only allow status update
    if (isClaimingItem && !isOwner) {
      if (
        name ||
        location ||
        description ||
        dateFound ||
        category ||
        image !== undefined
      ) {
        return res
          .status(403)
          .json({
            message:
              "You can only claim items. Only the owner can update other fields.",
          });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();
    if (description) updateData.description = description.trim();
    if (dateFound) updateData.dateFound = dateFound;
    if (category) updateData.category = category.trim();
    if (image !== undefined) updateData.image = image;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    updateData.updatedAt = new Date();

    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Create notification when item is claimed (status changes to "claimed")
    if (isClaimingItem && item.userId !== req.userId) {
      // Notify the item owner that their item has been claimed
      try {
        const notificationsCollection = db.collection("Notifications");

        const notification = {
          userId: item.userId, // Notify the item owner
          itemId: id,
          itemName: item.name,
          itemLocation: item.location,
          itemImage: item.image,
          itemCategory: item.category,
          dateFound: item.dateFound,
          read: false,
          createdAt: new Date(),
          type: "claimed", // Add a type field to distinguish claim notifications
        };

        await notificationsCollection.insertOne(notification);
        console.log(
          `Created claim notification for item owner: ${item.userId}, item: ${id}`
        );
      } catch (notificationError) {
        // Log error but don't fail the item update
        console.error("Error creating claim notification:", notificationError);
      }
    }

    res.json({ message: "Item updated successfully." });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id - Delete an item (requires authentication - can only delete own items)
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    // Check if item exists and belongs to the authenticated user
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.userId !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own items." });
    }

    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// GET /api/items/user/:userId - Get all items by a specific user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const items = await itemsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(items);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
