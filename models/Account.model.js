import  mongoose  from "mongoose"

const Schema = mongoose.Schema;
const bankingAccountSchema = new Schema({
    user: { type: Schema.Types.ObjectId,
		ref: 'User', 
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
    carts: [{
		 type: Schema.Types.ObjectId, 
		 ref: 'Cart' 
		}]
});
export const BankingAccount= mongoose.model("BankingAccount",bankingAccountSchema)

