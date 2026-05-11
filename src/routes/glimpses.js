const express = require("express");
const multer = require("multer");

const Glimpse = require("../models/Glimpse");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

const parseBoolean = (value, fallback = false) => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        if (value.toLowerCase() === "true") {
            return true;
        }

        if (value.toLowerCase() === "false") {
            return false;
        }
    }

    return fallback;
};

const parseTags = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        return value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
};

const buildPublicGlimpse = (glimpse) => {
    const plain = glimpse.toObject();
    const hasMedia = Boolean(plain.media?.data);
    const hasThumbnail = Boolean(plain.thumbnail?.data);

    return {
        ...plain,
        media: undefined,
        thumbnail: undefined,
        mediaUrl: hasMedia ? `/api/glimpses/${plain._id}/media` : plain.url || "",
        thumbnailUrl: hasThumbnail ? `/api/glimpses/${plain._id}/thumbnail` : plain.thumbnailUrl || ""
    };
};

const requireAdminAuth = (req, res, next) => {
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const authorizationHeader = req.headers.authorization || "";

    if (authorizationHeader.startsWith("Basic ")) {
        const credentials = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf8");
        const separatorIndex = credentials.indexOf(":");

        if (separatorIndex !== -1) {
            const providedUsername = credentials.slice(0, separatorIndex);
            const providedPassword = credentials.slice(separatorIndex + 1);

            if (providedUsername === adminUsername && providedPassword === adminPassword) {
                next();
                return;
            }
        }
    }

    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area", charset="UTF-8"');
    res.status(401).json({ message: "Authentication required." });
};

router.post(
    "/",
    requireAdminAuth,
    upload.fields([
        { name: "media", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    async (req, res) => {
        const {
            title,
            type,
            category,
            description,
            eventDate,
            tags,
            isFeatured,
            isPublished,
            displayOrder
        } = req.body || {};

        const mediaFile = req.files?.media?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!title || !type || !mediaFile) {
            res.status(400).json({ message: "Missing required glimpse fields." });
            return;
        }

        try {
            const glimpse = await Glimpse.create({
                title,
                type,
                category: category || "showcase",
                media: {
                    data: mediaFile.buffer,
                    contentType: mediaFile.mimetype,
                    filename: mediaFile.originalname
                },
                thumbnail: thumbnailFile
                    ? {
                          data: thumbnailFile.buffer,
                          contentType: thumbnailFile.mimetype,
                          filename: thumbnailFile.originalname
                      }
                    : undefined,
                description: description || "",
                eventDate: eventDate || null,
                tags: parseTags(tags),
                isFeatured: parseBoolean(isFeatured, false),
                isPublished: parseBoolean(isPublished, true),
                displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0
            });

            res.status(201).json(buildPublicGlimpse(glimpse));
        } catch (error) {
            console.error("Create glimpse error:", error);
            res.status(400).json({ message: "Failed to create glimpse." });
        }
    }
);

router.get("/", async (req, res) => {
    const { all, featured, limit = 100 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 100, 300);
    const filter = {
        $or: [{ "media.data": { $exists: true, $ne: null } }, { url: { $exists: true, $ne: "" } }]
    };

    if (all !== "true") {
        filter.isPublished = true;
    }
    if (featured === "true") {
        filter.isFeatured = true;
    }

    try {
        const glimpses = await Glimpse.find(filter)
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(parsedLimit);

        res.status(200).json(glimpses.map(buildPublicGlimpse));
    } catch (error) {
        console.error("List glimpses error:", error);
        res.status(500).json({ message: "Failed to fetch glimpses." });
    }
});

router.get("/:id/media", async (req, res) => {
    try {
        const glimpse = await Glimpse.findById(req.params.id);

        if (!glimpse || !glimpse.media?.data) {
            res.status(404).json({ message: "Media not found." });
            return;
        }

        res.setHeader("Content-Type", glimpse.media.contentType || "application/octet-stream");
        res.send(glimpse.media.data);
    } catch (error) {
        console.error("Fetch glimpse media error:", error);
        res.status(400).json({ message: "Invalid glimpse id." });
    }
});

router.get("/:id/thumbnail", async (req, res) => {
    try {
        const glimpse = await Glimpse.findById(req.params.id);

        if (!glimpse || !glimpse.thumbnail?.data) {
            res.status(404).json({ message: "Thumbnail not found." });
            return;
        }

        res.setHeader("Content-Type", glimpse.thumbnail.contentType || "application/octet-stream");
        res.send(glimpse.thumbnail.data);
    } catch (error) {
        console.error("Fetch glimpse thumbnail error:", error);
        res.status(400).json({ message: "Invalid glimpse id." });
    }
});

router.patch(
    "/:id",
    requireAdminAuth,
    upload.fields([
        { name: "media", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    async (req, res) => {
        const allowedUpdates = [
            "title",
            "type",
            "category",
            "description",
            "eventDate",
            "tags",
            "isFeatured",
            "isPublished",
            "displayOrder"
        ];
        const updates = {};

        for (const key of allowedUpdates) {

router.delete("/:id", requireAdminAuth, async (req, res) => {
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
            if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
                updates[key] = req.body[key];
            }
        }

        const mediaFile = req.files?.media?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (mediaFile) {
            updates.media = {
                data: mediaFile.buffer,
                contentType: mediaFile.mimetype,
                filename: mediaFile.originalname
            };
        }

        if (thumbnailFile) {
            updates.thumbnail = {
                data: thumbnailFile.buffer,
                contentType: thumbnailFile.mimetype,
                filename: thumbnailFile.originalname
            };
        }

        if (Object.prototype.hasOwnProperty.call(updates, "tags")) {
            updates.tags = parseTags(updates.tags);
        }

        if (Object.prototype.hasOwnProperty.call(updates, "isFeatured")) {
            updates.isFeatured = parseBoolean(updates.isFeatured, false);
        }

        if (Object.prototype.hasOwnProperty.call(updates, "isPublished")) {
            updates.isPublished = parseBoolean(updates.isPublished, true);
        }

        if (Object.prototype.hasOwnProperty.call(updates, "displayOrder")) {
            updates.displayOrder = Number.isFinite(Number(updates.displayOrder)) ? Number(updates.displayOrder) : 0;
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

            res.status(200).json(buildPublicGlimpse(updatedGlimpse));
        } catch (error) {
            console.error("Update glimpse error:", error);
            res.status(400).json({ message: "Failed to update glimpse." });
        }
    }
);

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

