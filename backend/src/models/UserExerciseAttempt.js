import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const UserExerciseAttempt = sequelize.define("UserExerciseAttempt", {
    user_answer: {
        type: DataTypes.JSON,
        allowNull: false
    },
    total_gaps: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correct_gaps: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_fully_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    grading_status: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: "graded"
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "user_exercise_attempts",
    timestamps: false
});
