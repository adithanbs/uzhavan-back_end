import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { asyncHandler } from "../middlewares/async-handler";
import { env } from "../config/env";
import { AppError } from "../utils/http-error";

const readRouteParam = (value: string | string[] | undefined, fieldName: string): string => {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (!value) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value;
};

const readQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    const trimmed = value[0].trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
};

const readPositiveIntegerQuery = (
  value: unknown,
  fieldName: string,
  defaultValue: number
): number => {
  const rawValue = readQueryString(value);

  if (!rawValue) {
    return defaultValue;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }

  return parsed;
};

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = readPositiveIntegerQuery(req.query.page, "page", 1);
  const requestedLimit = readPositiveIntegerQuery(
    req.query.limit,
    "limit",
    env.PRODUCT_LIST_DEFAULT_LIMIT
  );
  const limit = Math.min(requestedLimit, env.PRODUCT_LIST_MAX_LIMIT);
  const products = await productService.getProducts({
    page,
    limit,
    search: readQueryString(req.query.search),
    category: readQueryString(req.query.category),
    location: readQueryString(req.query.location)
  });

  res.setHeader("X-Page", String(page));
  res.setHeader("X-Limit", String(limit));
  res.json(products);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(readRouteParam(req.params.id, "id"));
  res.json(product);
});
