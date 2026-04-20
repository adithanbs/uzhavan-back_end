import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { asyncHandler } from "../middlewares/async-handler";
import { AppError } from "../utils/http-error";

const readQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
    success: true,
    data: product,
  });
  },
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const products = await productService.getProducts({
    page,
    limit,
    search: readQueryString(req.query.search),
    category: readQueryString(req.query.category),
    location: readQueryString(req.query.location),
  });

  res.setHeader("X-Page", String(page));
  res.setHeader("X-Limit", String(limit));
  res.status(200).json({
    success: true,
    data: products,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("id is required", 400);
  }

  const product = await productService.getProductById(id as string);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});
