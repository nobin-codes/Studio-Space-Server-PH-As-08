import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
export const createBooking = async (req, res) => {
    try {
        const { studioId, studioTitle, userEmail, userName, bookingDate, startTime, endTime, totalPrice, } = req.body;
        if (!studioId ||
            !studioTitle ||
            !userEmail ||
            !userName ||
            !bookingDate ||
            !startTime ||
            !endTime ||
            typeof totalPrice !== "number") {
            res.status(400).json({
                success: false,
                message: "Please provide all required booking information",
            });
            return;
        }
        if (!ObjectId.isValid(studioId)) {
            res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
            return;
        }
        if (startTime >= endTime) {
            res.status(400).json({
                success: false,
                message: "End time must be later than start time",
            });
            return;
        }
        const db = getDB();
        const studio = await db.collection("studios").findOne({
            _id: new ObjectId(studioId),
        });
        if (!studio) {
            res.status(404).json({
                success: false,
                message: "Studio not found",
            });
            return;
        }
        const conflictingBooking = await db.collection("bookings").findOne({
            studioId: new ObjectId(studioId),
            bookingDate,
            status: "Confirmed",
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });
        if (conflictingBooking) {
            res.status(409).json({
                success: false,
                message: "This studio is already booked for that time",
            });
            return;
        }
        const bookingData = {
            studioId: new ObjectId(studioId),
            studioTitle,
            userEmail,
            userName,
            bookingDate,
            startTime,
            endTime,
            totalPrice,
            status: "Pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection("bookings").insertOne(bookingData);
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                _id: result.insertedId,
                ...bookingData,
            },
        });
    }
    catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};
export const getMyBookings = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email || typeof email !== "string") {
            res.status(400).json({
                success: false,
                message: "User email is required",
            });
            return;
        }
        const db = getDB();
        const bookings = await db
            .collection("bookings")
            .find({ userEmail: email })
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        console.error("Get bookings error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings",
        });
    }
};
export const cancelBooking = async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
            return;
        }
        const db = getDB();
        const booking = await db.collection("bookings").findOne({
            _id: new ObjectId(id),
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found",
            });
            return;
        }
        if (booking.status !== "Pending") {
            res.status(400).json({
                success: false,
                message: "Only pending bookings can be cancelled",
            });
            return;
        }
        await db.collection("bookings").updateOne({ _id: new ObjectId(id), status: "Pending" }, {
            $set: {
                status: "Cancelled",
                updatedAt: new Date(),
            },
        });
        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
        });
    }
    catch (error) {
        console.error("Cancel booking error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};
