
import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/:id/cancel", cancelBooking);

export default router;
