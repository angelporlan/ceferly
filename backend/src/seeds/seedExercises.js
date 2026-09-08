import { Exercise } from "../models/Exercise.js";
import { Level } from "../models/Level.js";
import { Subcategory } from "../models/Subcategory.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadExternalExercises = async () => {
  const dataDir = path.join(__dirname, 'data');
  try {
    const files = await fs.readdir(dataDir);
    let externalData = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          externalData = [...externalData, ...parsed];
        }
      }
    }
    console.log(`Loaded ${externalData.length} exercises from external files.`);
    return externalData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log("No external data directory found, skipping.");
      return [];
    }
    console.error("Error loading external exercises:", error);
    return [];
  }
};

const exercisesData = [];

export const seedExercises = async () => {
  const level = await Level.findOne({ where: { name: "B2" } });

  const allSubcategories = await Subcategory.findAll();

  const subcategoryMap = {};
  allSubcategories.forEach(sub => {
    subcategoryMap[sub.name] = sub.id;
  });

  if (!level || !subcategoryMap["Multiple Choice"]) {
    throw new Error(
      "Level 'B2' or Subcategory 'Multiple Choice' not found. Please run seedLevels and seedSubcategories first."
    );
  }

  const externalData = await loadExternalExercises();
  const allExercises = [...exercisesData, ...externalData];

  console.log(`Seeding ${allExercises.length} total exercises (${exercisesData.length} hardcoded + ${externalData.length} from files)`);

  for (const data of allExercises) {
    let subCategoryIdToUse;

    if (data.subcategory_name && subcategoryMap[data.subcategory_name]) {
      subCategoryIdToUse = subcategoryMap[data.subcategory_name];
    } else {
      subCategoryIdToUse = subcategoryMap["Multiple Choice"];
    }

    const title = data.title_like.replaceAll('%', '').trim();
    await Exercise.findOrCreate({
      where: { title },
      defaults: {
        subcategory_id: subCategoryIdToUse,
        level_id: level.id,
        type: data.type || "multiple_choice",
        title,
        question_text: data.question_text,
        options: data.options,
        correct_answer: data.correct_answer,
      },
    });
  }

  console.log(`Successfully seeded ${allExercises.length} exercises.`);
};