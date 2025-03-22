const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankingAccountSchema = new Schema({
    user: { type: Schema.Types.ObjectId,
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
    carts: [{
		 type: Schema.Types.ObjectId, 
		 ref: 'Cart' 
		}]
});

module.exports = mongoose.model('BankingAccount', bankingAccountSchema);