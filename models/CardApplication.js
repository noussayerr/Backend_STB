
import  mongoose  from "mongoose"
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	cardType: { type: mongoose.Schema.Types.ObjectId, ref: 'CardType', required: true },
	status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
	personalInfo: {
	  firstName: String,
	  lastName: String,
	  email: String,
	  phone: String,
	  address: String
	},
	employmentInfo: {
	  status: String,
	  employer: String,
	  income: Number
	},
	BankingAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankingAccount' },
	createdAt: { type: Date, default: Date.now }
  });
  export const CardApplication = mongoose.model('CardApplication', applicationSchema);