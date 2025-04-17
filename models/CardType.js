import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cardTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  tag: { type: String, required: true },
  features: [{ type: String }],
  fees: {
    annual: { type: Number, required: true },
    withdrawal: { type: Number, required: true },
    replacement: { type: Number, required: true },
  },
  requirements: {
    minIncome: Number,
    employmentStatus: [String],
  },
  benefits: [
    {
      text: String,
      icon: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const CardType = mongoose.model("CardType", cardTypeSchema);