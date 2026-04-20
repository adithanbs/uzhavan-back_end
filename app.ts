import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import productRoutes from "./src/routers/product.router";
import { env, isProduction } from "./src/config/env";
import { errorHandler, notFoundHandler } from "./src/middlewares/error.middleware";
import { rateLimiter } from "./src/middlewares/rate-limit.middleware";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    hsts: isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true
        }
      : false
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_ORIGIN !== "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 204
  })
);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(rateLimiter);
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.REQUEST_BODY_LIMIT }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API Server is running",
    endpoints: {
      health: "/health",
      products: "/api/products"
    }
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      service: "uzhavan-back_end",
      environment: env.NODE_ENV,
      uptime: process.uptime()
    }
  });
});

app.use("/api/products", productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
