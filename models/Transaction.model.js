import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
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
  amount: { 
    type: Number, 
    required: true 
  },
  transactionType: { 
    type: String, 
    enum: ['fee', 'withdrawal', 'deposit', 'transfer'], 
    required: true
  },
  description: String
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);