
import { BankingAccount } from "../models/Account.model.js";
import { User } from "../models/user.model.js";

const accountController = {
    findrrib: async (req, res) => {
        const { rib } = req.body;
        
        // Validate input
        if (!rib) {
            return res.status(400).json({ 
                success: false, 
                message: "RIB/Account number is required" 
            });
        }

        try {
            // 1. Check if account exists
            const account = await BankingAccount.findOne({ accountNumber: rib });
            
            if (!account) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Account not found" 
                });
            }
            
            // 2. Check if any user is already linked to this account
            const userWithRib = await User.findOne({ 
                bankingAccounts: account._id 
            });

            if (userWithRib) {
                return res.status(409).json({ 
                    success: false, 
                    message: "This account is already associated with another user" 
                });
            }
            console.log(userWithRib)
            // 3. If all checks pass, return success
            return res.status(200).json({
                success: true,
                account: {
                    accountNumber: account.accountNumber,
                    balance: account.balance
                }
            });

        } catch (error) {
            console.error("Error in findrrib:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error",
                error: error.message 
            });
        }
    }
};

export default accountController;