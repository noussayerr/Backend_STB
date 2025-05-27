import mongoose from "mongoose";

const Schema = mongoose.Schema;

const creditTypeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  interestRate: { type: Number, required: true },
  duration: { type: String, required: true },
  eligibility: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, default: "#0ea5e9" },
  features: [{ type: String }],
  benefits: [{
    text: String,
    icon: String
  }],
  requirements: {
    minIncome: Number,
    minCreditScore: Number,
    employmentDuration: String
  },
  fees: {
    processing: Number,
    latePayment: Number,
    prepayment: Number
  },
  createdAt: { type: Date, default: Date.now },
});

export const CreditType = mongoose.model("CreditType", creditTypeSchema);