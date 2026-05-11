const express = require("express");

const Glimpse = require("../models/Glimpse");

const router = express.Router();

router.post("/", async (req, res) => {
    const { title, type, url, thumbnailUrl, description, eventDate, tags, isFeatured, isPublished, displayOrder } = req.body || {};

    if (!title || !type || !url) {
        res.status(400).json({ message: "Missing required glimpse fields." });
        return;
    }

    try {
        const glimpse = await Glimpse.create({
            title,
            type,
            url,
            thumbnailUrl: thumbnailUrl || "",
            description: description || "",
            eventDate: eventDate || null,
            tags: Array.isArray(tags) ? tags : [],
            isFeatured: Boolean(isFeatured),
            isPublished: typeof isPublished === "boolean" ? isPublished : true,
            displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0
        });

        res.status(201).json(glimpse);
    } catch (error) {
        console.error("Create glimpse error:", error);
        res.status(400).json({ message: "Failed to create glimpse." });
    }
});

router.get("/", async (req, res) => {
    const { all, featured, limit = 100 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 100, 300);
    const filter = {};

    if (all !== "true") {
        filter.isPublished = true;
    }
    if (featured === "true") {
        filter.isFeatured = true;
    }

    try {
        const glimpses = await Glimpse.find(filter)
            .sort({ displayOrder: 1, eventDate: -1, createdAt: -1 })
            .limit(parsedLimit);

        res.status(200).json(glimpses);
    } catch (error) {
        console.error("List glimpses error:", error);
        res.status(500).json({ message: "Failed to fetch glimpses." });
    }
});

router.patch("/:id", async (req, res) => {
    const allowedUpdates = [
        "title",
        "type",
        "url",
        "thumbnailUrl",
        "description",
        "eventDate",
        "tags",
        "isFeatured",
        "isPublished",
        "displayOrder"
    ];
    const updates = {};

    for (const key of allowedUpdates) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
            updates[key] = req.body[key];
        }
    }

    try {
        const updatedGlimpse = await Glimpse.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedGlimpse) {
            res.status(404).json({ message: "Glimpse not found." });
            return;
        }

        res.status(200).json(updatedGlimpse);
    } catch (error) {
        console.error("Update glimpse error:", error);
        res.status(400).json({ message: "Failed to update glimpse." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedGlimpse = await Glimpse.findByIdAndDelete(req.params.id);
        if (!deletedGlimpse) {
            res.status(404).json({ message: "Glimpse not found." });
            return;
        }

        res.status(200).json({ message: "Glimpse deleted." });
    } catch (error) {
        console.error("Delete glimpse error:", error);
        res.status(400).json({ message: "Failed to delete glimpse." });
    }
});

module.exports = router;

