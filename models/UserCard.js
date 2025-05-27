import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userCardSchema = new Schema({
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
  cardNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  cvv: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['active', 'blocked'], 
    default: 'active' 
  },
  currentBalance: { 
    type: Number, 
    default: 0 
  },
  fees: {
    annual: { type: Number, required: true },
    withdrawal: { type: Number, required: true },
    replacement: { type: Number, required: true },
  }
}, { timestamps: true });

export const UserCard = mongoose.model('UserCard', userCardSchema);