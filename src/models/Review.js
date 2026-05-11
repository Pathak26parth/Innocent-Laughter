const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        organizationName: { type: String, default: "", trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        message: { type: String, required: true, trim: true },
        source: {
            type: String,
            enum: ["website", "google-form", "manual"],
            default: "website"
        },
        isApproved: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

