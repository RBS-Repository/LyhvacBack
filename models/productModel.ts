import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    badge: { type: String, default: null },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    specifications: { type: Map, of: String, default: {} },
    features: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
