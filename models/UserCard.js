// models/UserCard.js

import  mongoose  from "mongoose"

const Schema = mongoose.Schema;
const userCardSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardType: { type: mongoose.Schema.Types.ObjectId, ref: 'CardType', required: true },
    cardNumber: { type: String, required: true, unique: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    spendingLimit: Number,
    currentBalance: { type: Number, default: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
  });

 export const  UserCard = mongoose.model('UserCard', userCardSchema);