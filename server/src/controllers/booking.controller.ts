
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { Booking } from "../models/booking.model.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

interface Studio {
  _id: ObjectId;
  title: string;
  hourlyRate: number;
}

const getAuthenticatedUser = (req: Request) =>
  (req as AuthenticatedRequest).user;

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);

    const {
      studioId,
      bookingDate,
      startTime,
      endTime,
    } = req.body;

    if (!studioId || !bookingDate || !startTime || !endTime) {
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

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      res.status(400).json({
        success: false,
        message: "Please provide valid booking times",
      });
      return;
    }

    const startMinutes =
      Number(startTime.slice(0, 2)) * 60 +
      Number(startTime.slice(3, 5));

    const endMinutes =
      Number(endTime.slice(0, 2)) * 60 +
      Number(endTime.slice(3, 5));

    if (endMinutes <= startMinutes) {
      res.status(400).json({
        success: false,
        message: "End time must be later than start time",
      });
      return;
    }

    const db = getDB();

    const studio = await db.collection<Studio>("studios").findOne({
      _id: new ObjectId(studioId),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    const conflictingBooking = await db.collection<Booking>("bookings").findOne({
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

    const duration = (endMinutes - startMinutes) / 60;
    const totalPrice = duration * studio.hourlyRate;

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      res.status(400).json({
        success: false,
        message: "Invalid studio pricing",
      });
      return;
    }

    const now = new Date();

    const bookingData: Booking = {
      studioId: new ObjectId(studioId),
      studioTitle: studio.title,
      userEmail: user.email,
      userName: user.name,
      bookingDate,
      startTime,
      endTime,
      totalPrice,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<Booking>("bookings").insertOne(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        _id: result.insertedId,
        ...bookingData,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);

    const db = getDB();

    const bookings = await db
      .collection<Booking>("bookings")
      .find({ userEmail: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
    });
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);
    const id = req.params.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const db = getDB();

    const result = await db.collection<Booking>("bookings").updateOne(
      {
        _id: new ObjectId(id),
        userEmail: user.email,
        status: "Pending",
      },
      {
        $set: {
          status: "Cancelled",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};
