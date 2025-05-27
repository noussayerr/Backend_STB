import mongoose from "mongoose";

const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bankingAccount: { 
    type: Schema.Types.ObjectId,  
    ref: 'BankingAccount',    
    required: true 
  },
  cardType: { 
    type: Schema.Types.ObjectId, 
    ref: 'CardType', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  cardInfo: {
    cardHolderName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryCity: { type: String, required: true },
    deliveryPostalCode: { type: String }
  },
  employmentInfo: {
    status: { type: String, required: true },
    employerName: { type: String },
    monthlyIncome: { type: Number, required: true }
  },
  adminNotes: String,
  processedAt: Date
}, { timestamps: true });

export const CardApplication = mongoose.model('CardApplication', applicationSchema);