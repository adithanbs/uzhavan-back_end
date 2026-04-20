import mongoose from "mongoose";
import ProductModel from "../models/product.model";
import { env } from "../config/env";
import { ProductInput } from "../types/product.types";
import { AppError } from "../utils/http-error";

export interface ProductListOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
}

const ensureValidProductId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid product id", 400);
  }
};

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildContainsRegex = (value?: string) => {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  return new RegExp(escapeRegex(normalized), "i");
};

export const createProduct = async (data: ProductInput) => {
  return ProductModel.create(data);
};

export const getProducts = async (options: ProductListOptions = {}) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? env.PRODUCT_LIST_DEFAULT_LIMIT;
  const filter: Record<string, unknown> = {};
  const searchRegex = buildContainsRegex(options.search);
  const categoryRegex = buildContainsRegex(options.category);
  const locationRegex = buildContainsRegex(options.location);

  if (searchRegex) {
    filter.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { location: searchRegex }
    ];
  }

  if (categoryRegex) {
    filter.category = categoryRegex;
  }

  if (locationRegex) {
    filter.location = locationRegex;
  }

  return ProductModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .maxTimeMS(5000);
};

export const getProductById = async (id: string) => {
  ensureValidProductId(id);

  const product = await ProductModel.findById(id).lean().maxTimeMS(5000);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};
