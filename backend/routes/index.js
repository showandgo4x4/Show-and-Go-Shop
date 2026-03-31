// routes/index.js
import express from "express";
import Product from "../models/product.js";

const router = express.Router();

// GET all products
router.get("/product", async (req, res) => {
  try {
    const products = await Product.find();  // fetch all products from DB
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
