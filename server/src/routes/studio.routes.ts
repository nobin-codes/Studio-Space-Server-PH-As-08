
import { Router } from "express";
import {
  getAllStudios,
  getFeaturedStudios,
  getSingleStudio,
  createStudio,
  updateStudio,
  deleteStudio,
} from "../controllers/studio.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllStudios);
router.get("/featured", getFeaturedStudios);
router.get("/:id", getSingleStudio);

// Protected routes
router.post("/", requireAuth, createStudio);
router.put("/:id", requireAuth, updateStudio);
router.delete("/:id", requireAuth, deleteStudio);

export default router;
