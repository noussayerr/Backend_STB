import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bankingAccountSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  accountNumber: { 
    type: String,
    required: true, 
    unique: true 
  },
  accountType: {
    type: Schema.Types.ObjectId,
    ref: 'AccountType',
    required: true
  },
  balance: {
    type: Number,
    default: 0 
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed'],
    default: 'active'
  },
  cards: [{
    type: Schema.Types.ObjectId, 
    ref: 'UserCard' 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const BankingAccount = mongoose.model("BankingAccount", bankingAccountSchema);