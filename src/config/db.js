import mongoose from "mongoose";
import { envs } from "./envs.js";

const connectDB = async () => {
    if (!envs.mongodbUri) {
        console.error("MongoDB connection error: MONGODB_URI is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(envs.mongodbUri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
