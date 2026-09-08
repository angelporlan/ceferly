import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subscription_role: {
        type: DataTypes.ENUM("free", "pro", "premium"),
        allowNull: false,
        defaultValue: "free"
    },
    subscription_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    daily_goal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
    },
    coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    hearts: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    avatar_seed: {
        type: DataTypes.STRING,
        allowNull: true
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_completed_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "users",
    hooks: {
        beforeSave: (user) => {
            if (user.changed("subscription_role")) {
                if (user.subscription_role === "free") {
                    user.subscription_expires_at = null;
                } else {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    user.subscription_expires_at = nextMonth;
                }
            }
        }
    }
});

User.prototype.checkStreak = async function () {
    if (!this.last_completed_date) return;

    const today = new Date();
    const lastCompleted = new Date(this.last_completed_date);

    const todayStr = today.toISOString().split('T')[0];
    const lastCompletedStr = this.last_completed_date;

    if (todayStr === lastCompletedStr) return;

    const diffTime = Math.abs(new Date(todayStr) - new Date(lastCompletedStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        this.streak = 0;
        await this.save();
    }
};

User.prototype.getActiveRole = function () {
    if (this.subscription_role === 'free') {
        return 'free';
    }

    if (!this.subscription_expires_at) {
        return 'free';
    }

    const now = new Date();
    const expirationDate = new Date(this.subscription_expires_at);

    if (now > expirationDate) {
        return 'free';
    }

    return this.subscription_role;
};
