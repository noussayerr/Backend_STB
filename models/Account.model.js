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
  balance: {
    type: Number, 
    default: 0 
  },
  cards: [{
    type: Schema.Types.ObjectId, 
    ref: 'UserCard' 
  }]
}, { timestamps: true });

export const BankingAccount = mongoose.model("BankingAccount", bankingAccountSchema);