const parseCorsOrigin = (origin: string | undefined): string | string[] => {
  if (!origin || origin === "*") return "*";
  return origin.split(",").map((item) => item.trim()).filter(Boolean);
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: toNumber(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI ?? "",
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
  TRUST_PROXY: process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true",
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT ?? "1mb",
  PRODUCT_LIST_DEFAULT_LIMIT: toNumber(process.env.PRODUCT_LIST_DEFAULT_LIMIT, 10),
  PRODUCT_LIST_MAX_LIMIT: toNumber(process.env.PRODUCT_LIST_MAX_LIMIT, 50)
};

export const isProduction = env.NODE_ENV === "production";