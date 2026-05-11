const mongoose = require("mongoose");

const glimpseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: { type: String, enum: ["image", "video"], required: true },
        url: { type: String, required: true, trim: true },
        thumbnailUrl: { type: String, default: "", trim: true },
        description: { type: String, default: "", trim: true },
        eventDate: { type: Date, default: null },
        tags: { type: [String], default: [] },
        isFeatured: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Glimpse", glimpseSchema);

