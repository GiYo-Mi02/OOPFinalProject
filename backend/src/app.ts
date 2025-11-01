import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRoutes } from "./routes/authRoutes";
import { voteRoutes } from "./routes/voteRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { instituteRoutes } from "./routes/instituteRoutes";
import { userRoutes } from "./routes/userRoutes";
import { authenticate } from "./middleware/authenticate";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/votes", authenticate, voteRoutes);
app.use("/api/admin", authenticate, adminRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/user", userRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

export { app };
