import mongoose from "mongoose";
import {env} from "./envConfig";

export const connectDB = async () => {
  try {
    console.log("Initialize the database ...");
    await mongoose.connect(env.DB_URI);
    console.log("DataBase connected ✅");
  } catch (err) {
    console.error("Database connection failed ❌", err);
    process.exit(1);
  }
};
