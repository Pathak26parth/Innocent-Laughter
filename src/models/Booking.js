const mongoose = require("mongoose");

const bookingReminderSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            enum: ["popup", "email"],
            default: "popup"
        },
        minutesBefore: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        customerName: { type: String, required: true, trim: true },
        organizationName: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        availableDate: { type: String, required: true },
        availableTime: { type: String, required: true },
        timezone: { type: String, default: "Asia/Kolkata" },
        paymentMethod: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending"
        },
        calendar: {
            createEvent: { type: Boolean, default: true },
            reminders: { type: [bookingReminderSchema], default: [] }
        },
        calendarSync: {
            provider: { type: String, default: "google" },
            eventId: { type: String, default: "" },
            syncedAt: { type: Date, default: null }
        },
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
        notes: { type: String, default: "" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

