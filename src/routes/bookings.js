const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/", async (req, res) => {
    const {
        customerName,
        organizationName,
        venue,
        availableDate,
        availableTime,
        paymentMethod,
        timezone,
        calendar,
        notes,
        transaction
    } = req.body || {};

    if (!customerName || !organizationName || !venue || !availableDate || !availableTime || !paymentMethod) {
        res.status(400).json({ message: "Missing required booking fields." });
        return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [booking] = await Booking.create(
            [
                {
                    customerName,
                    organizationName,
                    venue,
                    availableDate,
                    availableTime,
                    paymentMethod,
                    timezone: timezone || "Asia/Kolkata",
                    calendar: {
                        createEvent: calendar?.createEvent !== false,
                        reminders: Array.isArray(calendar?.reminders) ? calendar.reminders : []
                    },
                    notes: notes || ""
                }
            ],
            { session }
        );

        const amountFromPayload = Number(transaction?.amount);
        const transactionAmount =
            Number.isFinite(amountFromPayload) && amountFromPayload >= 0 ? amountFromPayload : 0;

        const [createdTransaction] = await Transaction.create(
            [
                {
                    bookingId: booking._id,
                    amount: transactionAmount,
                    currency: transaction?.currency || "INR",
                    method: transaction?.method || paymentMethod,
                    referenceId: transaction?.referenceId || "",
                    status: transaction?.status || "initiated",
                    paidAt: transaction?.paidAt || null,
                    meta: transaction?.meta || {}
                }
            ],
            { session }
        );

        booking.transaction = createdTransaction._id;
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Booking stored successfully. Backend can now sync calendar and reminders.",
            bookingId: booking._id,
            transactionId: createdTransaction._id
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create booking error:", error);
        res.status(500).json({ message: "Failed to store booking." });
    }
});

router.get("/", async (req, res) => {
    const { status, limit = 50 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 50, 200);
    const filter = status ? { status } : {};

    try {
        const bookings = await Booking.find(filter)
            .populate("transaction")
            .sort({ createdAt: -1 })
            .limit(parsedLimit);

        res.status(200).json(bookings);
    } catch (error) {
        console.error("List bookings error:", error);
        res.status(500).json({ message: "Failed to fetch bookings." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("transaction");
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Get booking error:", error);
        res.status(400).json({ message: "Invalid booking id." });
    }
});

router.patch("/:id", async (req, res) => {
    const allowedUpdates = [
        "status",
        "calendarSync",
        "notes",
        "paymentMethod",
        "availableDate",
        "availableTime",
        "venue"
    ];

    const updates = {};
    for (const key of allowedUpdates) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
            updates[key] = req.body[key];
        }
    }

    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedBooking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("Update booking error:", error);
        res.status(400).json({ message: "Failed to update booking." });
    }
});

module.exports = router;

