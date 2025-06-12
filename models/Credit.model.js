import mongoose from "mongoose";

const Schema = mongoose.Schema;

const creditSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bankingAccount: { type: Schema.Types.ObjectId, ref: 'BankingAccount', required: true },
  creditType: {type: String, enum: ['personal', 'mortgage', 'auto', 'business', 'student'], 
    required: true 
  },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  term: { type: Number,required: true },
  monthlyPayment: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: {type: Date, required: true },
  remainingBalance: {type: Number,required: true },
  status: { type: String, enum: ['active', 'paid', 'defaulted', 'cancelled'],default: 'active' },
  paymentHistory: [{
    paymentDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    principal: { type: Number, required: true },
    interest: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'missed', 'partial'], required: true }
  }],
  latePayments: { 
    type: Number, 
    default: 0 
  },
  fees: {
    origination: { type: Number, default: 0 },
    latePayment: { type: Number, default: 0 },
    prepayment: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const Credit = mongoose.model('Credit', creditSchema);