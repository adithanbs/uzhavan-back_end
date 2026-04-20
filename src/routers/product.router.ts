import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProduct
} from "../controllers/product.controller";

const router = Router();

router.route("/").get(getProducts).post(createProduct);
router.route("/:id").get(getProduct);

export default router;
