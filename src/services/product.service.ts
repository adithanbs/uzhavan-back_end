import mongoose from "mongoose";
import Product from "../models/product.model";
import { ProductInput } from "../types/product.types";
import { AppError } from "../utils/http-error";

const ensureValidProductId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid product id", 400);
  }
};

export const createProduct = async (data: ProductInput) => {
  return Product.create(data);
};

export const getProducts = async () => {
  return Product.find().sort({ createdAt: -1 }).lean();
};

export const getProductById = async (id: string) => {
  ensureValidProductId(id);

  const product = await Product.findById(id).lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};
