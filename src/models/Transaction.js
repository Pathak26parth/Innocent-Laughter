const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "INR", trim: true },
        method: { type: String, required: true, trim: true },
        referenceId: { type: String, default: "", trim: true },
        status: {
            type: String,
            enum: ["initiated", "pending", "success", "failed", "refunded"],
            default: "initiated"
        },
        paidAt: { type: Date, default: null },
        meta: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

