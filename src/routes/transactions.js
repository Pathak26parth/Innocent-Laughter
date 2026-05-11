const express = require("express");

const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/", async (req, res) => {
    const { bookingId, amount, currency, method, referenceId, status, paidAt, meta } = req.body || {};

    if (!bookingId || !Number.isFinite(Number(amount)) || Number(amount) < 0 || !method) {
        res.status(400).json({ message: "Missing required transaction fields." });
        return;
    }

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            res.status(404).json({ message: "Booking not found for transaction." });
            return;
        }

        const transaction = await Transaction.create({
            bookingId,
            amount: Number(amount),
            currency: currency || "INR",
            method,
            referenceId: referenceId || "",
            status: status || "initiated",
            paidAt: paidAt || null,
            meta: meta || {}
        });

        booking.transaction = transaction._id;
        await booking.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(500).json({ message: "Failed to create transaction." });
    }
});

router.get("/", async (req, res) => {
    const { bookingId, status, limit = 100 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 100, 300);
    const filter = {};

    if (bookingId) filter.bookingId = bookingId;
    if (status) filter.status = status;

    try {
        const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(parsedLimit);
        res.status(200).json(transactions);
    } catch (error) {
        console.error("List transactions error:", error);
        res.status(500).json({ message: "Failed to fetch transactions." });
    }
});

router.patch("/:id", async (req, res) => {
    const allowedUpdates = ["status", "referenceId", "paidAt", "meta"];
    const updates = {};

    for (const key of allowedUpdates) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
            updates[key] = req.body[key];
        }
    }

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedTransaction) {
            res.status(404).json({ message: "Transaction not found." });
            return;
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error("Update transaction error:", error);
        res.status(400).json({ message: "Failed to update transaction." });
    }
});

module.exports = router;

