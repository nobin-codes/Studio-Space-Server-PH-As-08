
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const ALLOWED_CATEGORIES = [
  "Photo Studios",
  "Film Stages",
  "Sound Stages",
  "Podcast Rooms",
  "Music Suites",
  "Art Workshops",
];

const ALLOWED_AMENITIES = [
  "Professional Lighting",
  "Camera Equipment",
  "Soundproofing",
  "Air Conditioning",
  "Wi-Fi",
  "Makeup Room",
  "Changing Room",
  "Parking",
  "Restroom",
  "Waiting Area",
];

const STUDIO_FIELDS = [
  "title",
  "category",
  "hourlyRate",
  "securityDeposit",
  "maxCapacity",
  "location",
  "imageUrl",
  "overview",
  "amenities",
];

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getAuthenticatedUser = (req: Request) =>
  (req as AuthenticatedRequest).user;

const isValidImageUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const validateStudioFields = (
  body: unknown,
  partial = false
): { data?: Record<string, unknown>; error?: string } => {
  if (!isRecord(body)) {
    return { error: "Invalid studio information" };
  }

  const data: Record<string, unknown> = {};

  const requiredFields = [
    "title",
    "category",
    "hourlyRate",
    "securityDeposit",
    "maxCapacity",
    "location",
    "imageUrl",
    "overview",
  ];

  if (!partial) {
    for (const field of requiredFields) {
      if (!(field in body)) {
        return { error: `${field} is required` };
      }
    }
  }

  for (const field of STUDIO_FIELDS) {
    if (!(field in body)) continue;

    const value = body[field];

    switch (field) {
      case "title": {
        if (
          typeof value !== "string" ||
          value.trim().length < 2 ||
          value.trim().length > 100
        ) {
          return {
            error: "Studio name must be between 2 and 100 characters",
          };
        }

        data.title = value.trim();
        break;
      }

      case "category": {
        if (
          typeof value !== "string" ||
          !ALLOWED_CATEGORIES.includes(value)
        ) {
          return { error: "Please select a valid studio category" };
        }

        data.category = value;
        break;
      }

      case "hourlyRate": {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value <= 0 ||
          value > 1000000
        ) {
          return { error: "Hourly rate must be greater than zero" };
        }

        data.hourlyRate = value;
        break;
      }

      case "securityDeposit": {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 1000000
        ) {
          return { error: "Please provide a valid security deposit" };
        }

        data.securityDeposit = value;
        break;
      }

      case "maxCapacity": {
        if (
          typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 1 ||
          value > 10000
        ) {
          return { error: "Maximum capacity must be a positive whole number" };
        }

        data.maxCapacity = value;
        break;
      }

      case "location": {
        if (
          typeof value !== "string" ||
          value.trim().length < 3 ||
          value.trim().length > 300
        ) {
          return { error: "Please provide a valid studio location" };
        }

        data.location = value.trim();
        break;
      }

      case "imageUrl": {
        if (
          typeof value !== "string" ||
          value.length > 2048 ||
          !isValidImageUrl(value.trim())
        ) {
          return { error: "Please provide a valid studio image URL" };
        }

        data.imageUrl = value.trim();
        break;
      }

      case "overview": {
        if (
          typeof value !== "string" ||
          value.trim().length < 10 ||
          value.trim().length > 3000
        ) {
          return {
            error: "Studio overview must be between 10 and 3000 characters",
          };
        }

        data.overview = value.trim();
        break;
      }

      case "amenities": {
        if (
          !Array.isArray(value) ||
          !value.every(
            (item): item is string =>
              typeof item === "string" &&
              ALLOWED_AMENITIES.includes(item)
          )
        ) {
          return { error: "Please provide valid studio amenities" };
        }

        data.amenities = [...new Set(value)];
        break;
      }
    }
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: "Please provide at least one valid field to update" };
  }

  if (!partial && !("amenities" in data)) {
    data.amenities = [];
  }

  return { data };
};

// GET ALL STUDIOS
export const getAllStudios = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();

    const studios = await db
      .collection("studios")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Studios retrieved successfully",
      data: studios,
    });
  } catch (error) {
    console.error("Get studios error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve studios",
    });
  }
};

// GET FEATURED STUDIOS
export const getFeaturedStudios = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = getDB();

    const studios = await db
      .collection("studios")
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      message: "Featured studios retrieved successfully",
      data: studios,
    });
  } catch (error) {
    console.error("Get featured studios error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve featured studios",
    });
  }
};

// GET SINGLE STUDIO
export const getSingleStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const db = getDB();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio retrieved successfully",
      data: studio,
    });
  } catch (error) {
    console.error("Get single studio error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve studio",
    });
  }
};

// CREATE STUDIO
export const createStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to create a studio",
      });
      return;
    }

    const validation = validateStudioFields(req.body);

    if (validation.error || !validation.data) {
      res.status(400).json({
        success: false,
        message: validation.error || "Invalid studio information",
      });
      return;
    }

    const now = new Date();

    const studioData = {
      ...validation.data,
      ownerId: user.id,
      ownerEmail: user.email,
      hostName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    const db = getDB();

    const result = await db.collection("studios").insertOne(studioData);

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: {
        _id: result.insertedId,
        ...studioData,
      },
    });
  } catch (error) {
    console.error("Create studio error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create studio",
    });
  }
};

// UPDATE STUDIO
export const updateStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to update a studio",
      });
      return;
    }

    const validation = validateStudioFields(req.body, true);

    if (validation.error || !validation.data) {
      res.status(400).json({
        success: false,
        message: validation.error || "Invalid studio information",
      });
      return;
    }

    const db = getDB();

    const result = await db.collection("studios").updateOne(
      {
        _id: new ObjectId(id),
        ownerId: user.id,
      },
      {
        $set: {
          ...validation.data,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      const studio = await db.collection("studios").findOne({
        _id: new ObjectId(id),
      });

      res.status(studio ? 403 : 404).json({
        success: false,
        message: studio
          ? "You are not allowed to update this studio"
          : "Studio not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
    });
  } catch (error) {
    console.error("Update studio error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update studio",
    });
  }
};

// DELETE STUDIO
export const deleteStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please log in to delete a studio",
      });
      return;
    }

    const db = getDB();

    const result = await db.collection("studios").deleteOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (result.deletedCount === 0) {
      const studio = await db.collection("studios").findOne({
        _id: new ObjectId(id),
      });

      res.status(studio ? 403 : 404).json({
        success: false,
        message: studio
          ? "You are not allowed to delete this studio"
          : "Studio not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    console.error("Delete studio error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete studio",
    });
  }
};
