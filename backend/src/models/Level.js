import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Level = sequelize.define("Level", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "levels",
    timestamps: false
});
