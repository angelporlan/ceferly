import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Subcategory = sequelize.define("Subcategory", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "subcategories",
    timestamps: false
});
