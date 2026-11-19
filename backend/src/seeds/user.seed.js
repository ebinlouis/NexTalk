import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { connectDB } = await import("../config/db.js");
const { default: User } = await import("../models/user.model.js");
const { hashPassword } = await import("../utils/bcrypt.js");

const seedUsers = [
  {
    fullName: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    profilePic: "",
  },
  {
    fullName: "Bob Smith",
    email: "bob@example.com",
    password: "password123",
    profilePic: "",
  },
  {
    fullName: "Charlie Brown",
    email: "charlie@example.com",
    password: "password123",
    profilePic: "",
  },
];

const runSeed = async () => {
  try {
    await connectDB();
    for (const u of seedUsers) {
      const hashedPassword = await hashPassword(u.password);
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u, password: hashedPassword },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Seeded user: ${u.fullName} (${u.email})`);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();
