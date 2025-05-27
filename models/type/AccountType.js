// models/AccountType.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const accountTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  requirements: {
    minDeposit: { type: Number, required: true },
    minBalance: Number,
  },
  fees: {
    monthly: { type: Number, required: true },
    transaction: Number,
    internationalTransfer: Number,
  },
  icon: { type: String },
  interestRate: Number,
  createdAt: { type: Date, default: Date.now },
});

export const AccountType = mongoose.model("AccountType", accountTypeSchema);