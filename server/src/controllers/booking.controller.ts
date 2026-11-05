
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

const isValidBookingDate = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  return day >= 1 && day <= daysInMonth;
};

const isValidTime = (time: string): boolean =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

const getTimeInMinutes = (time: string): number =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to create a booking",
      });
      return;
    }

    const { studioId, bookingDate, startTime, endTime } = req.body;

    if (
      typeof studioId !== "string" ||
      typeof bookingDate !== "string" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      !studioId ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
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

    if (!isValidBookingDate(bookingDate)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid booking date",
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (bookingDate < today) {
      res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
      return;
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      res.status(400).json({
        success: false,
        message: "Please provide valid booking times",
      });
      return;
    }

    const startMinutes = getTimeInMinutes(startTime);
    const endMinutes = getTimeInMinutes(endTime);

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

    if (
      typeof studio.hourlyRate !== "number" ||
      !Number.isFinite(studio.hourlyRate) ||
      studio.hourlyRate < 0
    ) {
      res.status(400).json({
        success: false,
        message: "This studio has invalid pricing",
      });
      return;
    }

    const conflictingBooking = await db
      .collection<Booking>("bookings")
      .findOne({
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
        message: "Invalid booking price",
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

    const result = await db
      .collection<Booking>("bookings")
      .insertOne(bookingData);

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

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to view your bookings",
      });
      return;
    }

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

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to cancel a booking",
      });
      return;
    }

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
