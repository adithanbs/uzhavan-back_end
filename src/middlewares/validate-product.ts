import { RequestHandler } from "express";
import { AppError } from "../utils/http-error";

const allowedProductFields = new Set([
  "name",
  "category",
  "price",
  "quantity",
  "location",
  "phone",
  "images",
  "description"
]);

const requiredCreateFields = ["name", "category", "price", "quantity", "location", "phone"] as const;
const phoneRegex = /^\+?[0-9\s-]{7,20}$/;

const isObjectPayload = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (
  value: unknown,
  fieldName: string,
  options: { required?: boolean; maxLength?: number } = {}
): string | undefined => {
  if (value === undefined || value === null || value === "") {
    if (options.required) {
      throw new AppError(`${fieldName} is required`, 400);
    }

    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400);
  }

  const trimmedValue = value.trim();

  if (options.required && trimmedValue.length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  if (options.maxLength && trimmedValue.length > options.maxLength) {
    throw new AppError(`${fieldName} must be ${options.maxLength} characters or less`, 400);
  }

  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const readPrice = (value: unknown, required: boolean): number | undefined => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new AppError("price is required", 400);
    }

    return undefined;
  }

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    throw new AppError("price must be a valid non-negative number", 400);
  }

  return price;
};

const readImages = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AppError("images must be an array of strings", 400);
  }

  if (value.length > 8) {
    throw new AppError("images cannot contain more than 8 items", 400);
  }

  return value.map((image, index) => {
    if (typeof image !== "string" || image.trim().length === 0) {
      throw new AppError(`images[${index}] must be a non-empty string`, 400);
    }

    if (image.length > 2048) {
      throw new AppError(`images[${index}] is too long`, 400);
    }

    return image.trim();
  });
};

export const validateProduct = (): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (!isObjectPayload(req.body)) {
        throw new AppError("Request body must be a JSON object", 400);
      }

      const body = req.body;
      const unknownFields = Object.keys(body).filter((field) => !allowedProductFields.has(field));

      if (unknownFields.length > 0) {
        throw new AppError(`Unknown product fields: ${unknownFields.join(", ")}`, 400);
      }

      for (const field of requiredCreateFields) {
        if (body[field] === undefined || body[field] === null || body[field] === "") {
          throw new AppError(`${field} is required`, 400);
        }
      }

      const sanitized = {
        name: readString(body.name, "name", { required: true, maxLength: 120 }),
        category: readString(body.category, "category", { required: true, maxLength: 80 }),
        price: readPrice(body.price, true),
        quantity: readString(body.quantity, "quantity", { required: true, maxLength: 60 }),
        location: readString(body.location, "location", { required: true, maxLength: 120 }),
        phone: readString(body.phone, "phone", { required: true, maxLength: 20 }),
        images: readImages(body.images),
        description: readString(body.description, "description", { maxLength: 1000 })
      };

      if (sanitized.phone && !phoneRegex.test(sanitized.phone)) {
        throw new AppError("phone must be a valid phone number", 400);
      }

      req.body = Object.fromEntries(
        Object.entries(sanitized).filter(([, value]) => value !== undefined)
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};
