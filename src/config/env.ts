import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

const validNodeEnvs: NodeEnv[] = ["development", "production", "test"];

const readRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
};

const readNodeEnv = (): NodeEnv => {
  const nodeEnv = process.env.NODE_ENV ?? "development";

  if (!validNodeEnvs.includes(nodeEnv as NodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${nodeEnv}". Expected one of: ${validNodeEnvs.join(", ")}`
    );
  }

  return nodeEnv as NodeEnv;
};

const readPort = (): number => {
  const rawPort = process.env.PORT ?? "5000";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT "${rawPort}". PORT must be a positive integer.`);
  }

  return port;
};

const readCorsOrigin = (nodeEnv: NodeEnv): string | string[] => {
  const rawOrigin = process.env.CORS_ORIGIN;

  if (!rawOrigin || rawOrigin.trim().length === 0) {
    if (nodeEnv === "production") {
      throw new Error("CORS_ORIGIN must be configured in production.");
    }

    return "*";
  }

  const origins = rawOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
};

const nodeEnv = readNodeEnv();

export const env = {
  NODE_ENV: nodeEnv,
  PORT: readPort(),
  MONGO_URI: readRequiredEnv("MONGO_URI"),
  CORS_ORIGIN: readCorsOrigin(nodeEnv),
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT ?? "1mb"
} as const;

export const isProduction = env.NODE_ENV === "production";
