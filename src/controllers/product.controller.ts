import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { asyncHandler } from "../middlewares/async-handler";
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

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getProducts();
  res.json(products);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(readRouteParam(req.params.id, "id"));
  res.json(product);
});
