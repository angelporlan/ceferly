import { User } from "./User.js";
import { UserExerciseAttempt } from "./UserExerciseAttempt.js";
import { Exercise } from "./Exercise.js";
import { Subcategory } from "./Subcategory.js";
import { Level } from "./Level.js";
import { Category } from "./Category.js";
import { AttemptExplanation } from "./AttemptExplanation.js";
import { AiUsageDaily } from "./AiUsageDaily.js";

// User ↔ UserExerciseAttempt
User.hasMany(UserExerciseAttempt, {
    foreignKey: "user_id",
    onDelete: "CASCADE"
});
UserExerciseAttempt.belongsTo(User, {
    foreignKey: "user_id"
});

// Exercise ↔ UserExerciseAttempt
Exercise.hasMany(UserExerciseAttempt, {
    foreignKey: "exercise_id",
    onDelete: "CASCADE"
});
UserExerciseAttempt.belongsTo(Exercise, {
    foreignKey: "exercise_id",
    as: "exercise"
});

// Category ↔ Subcategory
Category.hasMany(Subcategory, {
    foreignKey: "category_id",
    onDelete: "CASCADE"
});
Subcategory.belongsTo(Category, {
    foreignKey: "category_id"
});

// Subcategory ↔ Exercise
Subcategory.hasMany(Exercise, {
    foreignKey: "subcategory_id",
    onDelete: "CASCADE"
});
Exercise.belongsTo(Subcategory, {
    foreignKey: "subcategory_id"
});

// Level ↔ Exercise
Level.hasMany(Exercise, {
    foreignKey: "level_id",
    onDelete: "CASCADE"
});
Exercise.belongsTo(Level, {
    foreignKey: "level_id"
});

// UserExerciseAttempt ↔ AttemptExplanation
UserExerciseAttempt.hasOne(AttemptExplanation, {
    foreignKey: "attempt_id",
    onDelete: "CASCADE"
});

AttemptExplanation.belongsTo(UserExerciseAttempt, {
    foreignKey: "attempt_id"
});

// User ↔ AiUsageDaily
User.hasMany(AiUsageDaily, { foreignKey: "user_id" });
AiUsageDaily.belongsTo(User, { foreignKey: "user_id" });



export {
    User,
    UserExerciseAttempt,
    Exercise,
    Subcategory,
    Level,
    Category
};
