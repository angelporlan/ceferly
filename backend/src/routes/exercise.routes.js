import express from "express";
import { getExercises, getExerciseById, getCategories, getSubcategories } from "../controllers/exercise.controller.js";
import { optionalAuthenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/exercises", optionalAuthenticate, getExercises);
router.get("/exercises/:id", optionalAuthenticate, getExerciseById);
router.get("/categories", optionalAuthenticate, getCategories);
router.get("/subcategories", optionalAuthenticate, getSubcategories);

export default router;
