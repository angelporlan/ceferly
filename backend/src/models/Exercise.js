import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Exercise = sequelize.define("Exercise", {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    options: {
        type: DataTypes.JSON
    },
    correct_answer: {
        type: DataTypes.JSON,
        allowNull: false
    },
    audio_url: {
        type: DataTypes.STRING
    },
    reading_text: {
        type: DataTypes.TEXT
    }
}, {
    tableName: "exercises",
    timestamps: false
});
