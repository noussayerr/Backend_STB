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
    // New field for push notification tokens
    expoPushTokens: [{
        token: { type: String, unique: true, sparse: true }, // unique and sparse to allow nulls and prevent duplicates
        deviceId: { type: String }, // Optional: to identify the device
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);