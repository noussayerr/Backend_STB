import  mongoose  from "mongoose"

const Schema = mongoose.Schema;

const cartSchema = new Schema({
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
    transactions: [{ 
		type: Schema.Types.ObjectId, 
		ref: 'Transaction' 
	}]
	,type: {
		type: String,
		required: true,
		enum: ['cart', 'wallet']
	},
	isblocked: {
		type: Boolean,
		default: false
	}	
});
export const Cart= mongoose.model("Cart",cartSchema)