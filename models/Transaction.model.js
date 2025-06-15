import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  senderAccount: { 
    type: Schema.Types.ObjectId, 
    ref: 'BankingAccount', 
    required: true 
  },
  recipientAccount: { 
    type: Schema.Types.ObjectId, 
    ref: 'BankingAccount', 
    required: true 
  },
  amount: { 
    type: Number,
    required: true,
    min: 0.01
  },
  transactionType: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal','fee'],
    default: 'transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: String,
  reference: String
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);