
import { Request, Response } from "express";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

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

export const createStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;

    const {
      _id,
      createdAt,
      updatedAt,
      ownerId,
      ownerEmail,
      hostName,
      ...studioFields
    } = req.body;

    const studioData = {
      ...studioFields,
      ownerId: user.id,
      ownerEmail: user.email,
      hostName: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;

    const {
      _id,
      createdAt,
      updatedAt,
      ownerId,
      ownerEmail,
      hostName,
      ...updateFields
    } = req.body;

    const updateData = {
      ...updateFields,
      updatedAt: new Date(),
    };

    const db = getDB();

    const result = await db.collection("studios").updateOne(
      {
        _id: new ObjectId(id),
        ownerId: user.id,
      },
      {
        $set: updateData,
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

    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;

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
