import express from "express";
import cors from "cors";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { sequelize } from "./config/db.js";
import "./models/index.js";
import "dotenv/config";

import exerciseAttemptRoutes from "./routes/exerciseAttempt.routes.js";
import authRoutes from "./routes/auth.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

import { seedLevels } from "./seeds/seedLevels.js";
import { seedCategories } from "./seeds/seedCategories.js";
import { seedSubcategories } from "./seeds/seedSubcategories.js";
import { seedExercises } from "./seeds/seedExercises.js";
import { seedUsers } from "./seeds/seedUsers.js";
import { seedUserExerciseAttempts } from "./seeds/seedUserExerciseAttempts.js";

const app = express();
const execFileAsync = promisify(execFile);

app.use(cors());
app.use(express.json());

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

app.use("/api", exerciseAttemptRoutes);
app.use("/api", authRoutes);
app.use("/api", exerciseRoutes);
app.use("/api", userRoutes);
app.use("/api", aiRoutes);
app.use("/api", paymentsRoutes);

(async () => {
    try {
        if (process.env.ENV === "TEST" || process.env.NODE_ENV !== "production") {
            console.log("Applying Prisma migrations...");
            const { stdout, stderr } = await execFileAsync(
                "npx",
                ["prisma", "migrate", "deploy"],
                { cwd: process.cwd() }
            );

            if (stdout) {
                console.log(stdout.trim());
            }
            if (stderr) {
                console.error(stderr.trim());
            }

            console.log("Seeding development data...");
            await seedLevels();
            await seedCategories();
            await seedSubcategories();
            await seedUsers();
            await seedExercises();
            await seedUserExerciseAttempts();
            console.log("Seeds ejecutadas correctamente");
        }

        await sequelize.authenticate();
        console.log("Base de datos conectada");

        const PORT = process.env.ENV === "TEST" ? process.env.PORT_TEST : process.env.PORT_PROD || 4000;
        const URL = process.env.ENV === "TEST" ? process.env.URL_TEST : process.env.URL_PROD || "http://localhost";

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en ${URL}:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor o la DB:", error);
        process.exit(1);
    }
})();
