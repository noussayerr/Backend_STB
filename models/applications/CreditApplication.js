import mongoose from "mongoose";

const Schema = mongoose.Schema;

const creditApplicationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creditType: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditType', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  bankingAccount: { 
    type: Schema.Types.ObjectId,  
    ref: 'BankingAccount',    
    required: true 
  },
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    dateOfBirth: { type: Date },
    idNumber: { type: String, required: true }
  },
  
  // Credit Information
  creditInfo: {
    amountRequested: { type: Number, required: true },
    duration: { type: Number, required: true },
    purpose: { type: String, required: true },
    rib: { type: String, required: true },
    monthlyPayment: { type: Number, required: true },
    interestRate: { type: Number, required: true }
  },
  
  // Financial Information
  financialInfo: {
    employmentStatus: { type: String, required: true },
    employerName: { type: String },
    monthlyIncome: { type: Number, required: true },
    otherLoans: { type: Boolean, default: false },
    loanDetails: { type: String }
  },
  
  // System Info
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  adminNote: { type: String }
});

export const CreditApplication = mongoose.model('CreditApplication', creditApplicationSchema);