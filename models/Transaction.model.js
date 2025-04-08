import  mongoose  from "mongoose"
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cart: { 
        type: Schema.Types.ObjectId, 
        ref: 'Cart', 
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
    transactionDate: { 
        type: Date, 
        default: Date.now 
    },
    transactionType: { 
        type: String, 
        enum: ['cart', 'bank'], 
        required: true
     }
});
export const Transaction= mongoose.model("Transaction",transactionSchema)