import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const phoneRegex = /^\+?[0-9\s-]{7,20}$/;
const isHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [120, "Product name must be 120 characters or less"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [80, "Category must be 80 characters or less"]
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: String,
      trim: true,
      maxlength: [60, "Quantity must be 60 characters or less"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [120, "Location must be 120 characters or less"]
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      maxlength: [20, "Phone must be 20 characters or less"],
      match: [phoneRegex, "Phone must be a valid phone number"]
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [2048, "Image URL must be 2048 characters or less"],
          validate: {
            validator: isHttpUrl,
            message: "Image must be a valid http or https URL"
          }
        }
      ],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (images: string[]) => images.length >= 1 && images.length <= 8,
        message: "Images must contain between 1 and 8 items"
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be 1000 characters or less"]
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", category: "text", location: "text" });

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export default model<Product>("Product", productSchema);
