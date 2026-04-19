import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const phoneRegex = /^\+?[0-9\s-]{7,20}$/;

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
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required"],
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
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) => images.length <= 8,
        message: "Images cannot contain more than 8 items"
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
    versionKey: false
  }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", category: "text", location: "text" });

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export default model<Product>("Product", productSchema);
