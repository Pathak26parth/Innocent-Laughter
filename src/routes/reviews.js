const express = require("express");

const Review = require("../models/Review");

const router = express.Router();

router.post("/", async (req, res) => {
    const { name, organizationName, rating, message, source, isApproved, isPublished } = req.body || {};

    if (!name || !message || !Number.isFinite(Number(rating))) {
        res.status(400).json({ message: "Missing required review fields." });
        return;
    }

    try {
        const review = await Review.create({
            name,
            organizationName: organizationName || "",
            rating: Number(rating),
            message,
            source: source || "website",
            isApproved: Boolean(isApproved),
            isPublished: Boolean(isPublished)
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Create review error:", error);
        res.status(400).json({ message: "Failed to create review." });
    }
});

router.get("/", async (req, res) => {
    const { all, limit = 100 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 100, 300);
    const filter = all === "true" ? {} : { isPublished: true, isApproved: true };

    try {
        const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(parsedLimit);
        res.status(200).json(reviews);
    } catch (error) {
        console.error("List reviews error:", error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
});

router.patch("/:id", async (req, res) => {
    const allowedUpdates = ["name", "organizationName", "rating", "message", "isApproved", "isPublished", "source"];
    const updates = {};

    for (const key of allowedUpdates) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
            updates[key] = req.body[key];
        }
    }

    try {
        const updatedReview = await Review.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedReview) {
            res.status(404).json({ message: "Review not found." });
            return;
        }

        res.status(200).json(updatedReview);
    } catch (error) {
        console.error("Update review error:", error);
        res.status(400).json({ message: "Failed to update review." });
    }
});

module.exports = router;

