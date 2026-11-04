
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

    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "https://studio-space-nu.vercel.app",
        ],
        credentials: true,
      })
    );

    app.all("/api/auth/{*any}", toNodeHandler(auth));

    app.use(express.json());

    // Google Search Console ownership verification
    app.get("/", (req: Request, res: Response) => {
      res.status(200).type("html").send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="google-site-verification" content="EGjwAPDNMF_pikRdVYsVCpq9MQaAcgwcG0mhPQGJVNA" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>StudioSpace API</title>
          </head>
          <body>
            <h1>StudioSpace API is running successfully!</h1>
          </body>
        </html>
      `);
    });

    app.use("/api/studios", studioRoutes);
    app.use("/api/bookings", bookingRoutes);

    app.listen(PORT, () => {
      console.log(`StudioSpace server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
