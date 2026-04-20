import mongoose from "mongoose";
import { env, isProduction } from "./env";

export const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: !isProduction,
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });

  console.log("MongoDB connected");
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};
