import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import studioRoutes from "./routes/studio.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const auth = createAuth();

   // CORS must run before all routes
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth must come before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

    app.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "StudioSpace API is running successfully!",
      });
    });

    app.use("/api/studios", studioRoutes);
    app.use("/api/bookings", bookingRoutes);

    app.listen(PORT, () => {
      console.log(`StudioSpace server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
