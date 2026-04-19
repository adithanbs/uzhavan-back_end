import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected");
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};
