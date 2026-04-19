import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProduct
} from "../controllers/product.controller";
import { validateProduct } from "../middlewares/validate-product";

const router = Router();

router.route("/").get(getProducts).post(validateProduct(), createProduct);
router.route("/:id").get(getProduct);

export default router;
