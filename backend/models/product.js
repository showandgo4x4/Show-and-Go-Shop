import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  brand: String,
  category: String,
  imageUrl: String,
  stock: Number
});

export default mongoose.model("Product", productSchema);
