
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import studioRoutes from "./routes/studio.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://studio-space-nu.vercel.app",
    ],
    credentials: true,
  })
);

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="google-site-verification"
          content="EGjwAPDNMF_pikRdVYsVCpq9MQaAcgwcG0mhPQGJVNA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>StudioSpace API</title>
      </head>
      <body>
        <h1>StudioSpace API is running successfully!</h1>
      </body>
    </html>
  `);
});

// Ensure MongoDB is connected before API requests
app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Better Auth
const auth = createAuth();

app.all("/api/auth/*splat", toNodeHandler(auth));

// Parse JSON after Better Auth
app.use(express.json());

// Application routes
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handling
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Server error:", error);

    if (res.headersSent) {
      next(error);
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

// Vercel Express entry point
export default app;
