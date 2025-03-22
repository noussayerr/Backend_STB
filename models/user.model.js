
import  mongoose  from "mongoose"

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    socioProfessionalStatus: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    isadmin: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    carts: [{ type: Schema.Types.ObjectId, ref: 'Cart' }],
    bankingAccounts: [{ type: Schema.Types.ObjectId, ref: 'BankingAccount' }]
});

export const User= mongoose.model("User",userSchema)