// models/user.model.js (assuming your User model is here)
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    maritalStatus: { type: String },
    socioProfessionalStatus: { type: String },
    age: { type: Number },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date },
    resetPasswordtoken: { type: String },
    resetPasswordexpiresat: { type: Date },
    lastLogin: { type: Date, default: Date.now },
    pack: { type: String, enum: ['free', 'premium'], default: 'free' },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bankingAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankingAccount' }, 
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserCard' }], 
    credits:[{type: mongoose.Schema.Types.ObjectId, ref: 'Credit'}], 

}, { timestamps: true });
export const User = mongoose.model('User', userSchema);