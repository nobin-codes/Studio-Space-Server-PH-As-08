import { Request, Response, NextFunction } from "express";
import { createAuth } from "../config/auth.js";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = createAuth();

    const headers = new Headers();

    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => headers.append(key, item));
      } else if (value !== undefined) {
        headers.set(key, String(value));
      }
    });

    const session = await auth.api.getSession({
      headers,
    });
    if (!session) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};
