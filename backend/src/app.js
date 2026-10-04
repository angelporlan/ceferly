import "dotenv/config";
import express from "express";
import cors from "cors";
import "./models/index.js";

import exerciseAttemptRoutes from "./routes/exerciseAttempt.routes.js";
import authRoutes from "./routes/auth.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "ceferly-api" });
});

app.use("/api", exerciseAttemptRoutes);
app.use("/api", authRoutes);
app.use("/api", exerciseRoutes);
app.use("/api", userRoutes);
app.use("/api", aiRoutes);
app.use("/api", paymentsRoutes);
