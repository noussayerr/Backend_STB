import mongoose from "mongoose";

const Schema = mongoose.Schema;

const accountApplicationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountType: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountType', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    dateOfBirth: { type: Date, required: true },
    idNumber: { type: String, required: true }
  },
  
  // Account Information
  accountInfo: {
    initialDeposit: { type: Number, required: true },
    wantsDebitCard: { type: Boolean, default: false },
    wantsOnlineBanking: { type: Boolean, default: false }
  },
  
  // Financial Information
  financialInfo: {
    employmentStatus: { type: String, required: true },
    employerName: { type: String },
    monthlyIncome: { type: Number },
    sourceOfFunds: { type: String }
  },
  // System Info
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const AccountApplication = mongoose.model('AccountApplication', accountApplicationSchema);