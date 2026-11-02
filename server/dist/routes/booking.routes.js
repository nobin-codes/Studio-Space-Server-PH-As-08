import { Router } from "express";
import { createBooking, getMyBookings, cancelBooking, } from "../controllers/booking.controller.js";
const router = Router();
router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/:id/cancel", cancelBooking);
export default router;
