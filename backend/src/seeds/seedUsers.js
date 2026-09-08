import bcrypt from "bcrypt";
import { User } from "../models/User.js";

export const seedUsers = async () => {
    const password = "123456";

    const password_hash = await bcrypt.hash(password, 10);

    const userData = {
        name: "Ángel",
        username: "angel",
        email: "angel@example.com",
        password_hash: password_hash,
    };

    const [user, created] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData,
    });

    if (created) {
        console.log("User 'angel' created successfully.");
    } else {
        console.log("User 'angel' already exists. Skipping creation.");
    }
};