
import { BankingAccount } from "../models/Account.model.js";
import { User } from "../models/user.model.js";
import { AccountType } from '../models/type/AccountType.js';
import { AccountApplication } from "../models/applications/AccountApplication.js";
const accountController = {
    getAccountTypes: async (req, res) => {
        try {
          const accountTypes = await AccountType.find();
          res.status(200).json(accountTypes);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    
    getAccountTypeById: async (req, res) => {
        try {
          const accountType = await AccountType.findById(req.params.id);
          if (!accountType) {
            return res.status(404).json({ message: 'Account type not found' });
          }
          res.json(accountType);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    findrrib: async (req, res) => {
        const { rib } = req.body;
        
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
    },
    allapplications:async(req,res)=>{
    
        try {
          const accountApplication = await AccountApplication.find();
          res.status(201).json(accountApplication);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      getApplicationById: async (req, res) => {
        try {
            const application = await AccountApplication.findById(req.params.id)
                .populate('user', 'firstName lastName email')
                .populate('accountType', 'name description requirements');
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            res.status(200).json(application);
        } catch (error) {
            res.status(500).json({ message: "Error fetching application", error: error.message });
        }
    },
      getUserApplications : async (req, res) => {
        try {
          const applications = await AccountApplication.find({ user: req.user._id })
            .populate('accountType', 'name description');
            
          res.status(200).json({
            success: true,
            data: applications
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
          });
        }},


        submitAccountApplication : async (req, res) => {
        try {
          const {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            postalCode,
            dateOfBirth,
            idNumber,
            accountType,
            initialDeposit,
            wantsDebitCard,
            wantsOnlineBanking,
            employmentStatus,
            employerName,
            monthlyIncome,
            sourceOfFunds
          } = req.body;
          // Validate minimum deposit
          console.log(req.body)
          const selectedAccountType = await AccountType.findById(accountType);
          if (!selectedAccountType) {
            return res.status(400).json({
              success: false,
              message: 'Invalid account type'
            });
          }
      
          if (initialDeposit < selectedAccountType.requirements.minDeposit) {
            return res.status(400).json({
              success: false,
              message: `Initial deposit must be at least ${selectedAccountType.requirements.minDeposit} DT`
            });
          }
      
          const application = new AccountApplication({
            user: req.user._id,
            accountType,
            personalInfo: {
              firstName,
              lastName,
              email,
              phone,
              address,
              city,
              postalCode,
              dateOfBirth,
              idNumber
            },
            accountInfo: {
              initialDeposit,
              wantsDebitCard,
              wantsOnlineBanking
            },
            financialInfo: {
              employmentStatus,
              employerName,
              monthlyIncome,
              sourceOfFunds
            }
          });
      
          await application.save();
      
          res.status(201).json({
            success: true,
            message: 'Account application submitted successfully',
            data: application
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
          });
        }
      },
      updateApplicationStatus: async (req, res) => {
        try {
            const { status, adminNote } = req.body;
            const { id } = req.params;
            console.log("ss")
            if (!["pending", "approved", "rejected"].includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            
            const application = await AccountApplication.findByIdAndUpdate(
                id,
                { 
                    status,
                    updatedAt: Date.now(),
                },
                { new: true }
            );
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            // If approved, create the account
            if (status === "approved") {
                await accountController.createAccountFromApplication(application);
            }
            
            res.status(200).json({
                success: true,
                message: `Application ${status} successfully`,
                data: application
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: "Error updating application", 
                error: error.message 
            });
        }
    },


    createAccountFromApplication: async (application) => {
        try {
            const { user, accountType, accountInfo, personalInfo } = application;
            
            // Generate account number
            const accountNumber = accountController.generateAccountNumber(); 
            
            const newAccount = new BankingAccount({
                user,
                accountType,
                accountNumber,
                balance: accountInfo.initialDeposit,
                status: "active",
                debitCard: accountInfo.wantsDebitCard,
                onlineBanking: accountInfo.wantsOnlineBanking,
                accountHolder: {
                    firstName: personalInfo.firstName,
                    lastName: personalInfo.lastName,
                    email: personalInfo.email
                }
            });
            
            await newAccount.save();
            
            // Update user's accounts list
            await User.findByIdAndUpdate(user, {
                $push: { bankingAccounts: newAccount._id }
            });
            
            return newAccount;
        } catch (error) {
            console.error("Error creating account from application:", error);
            throw error;
        }
    },

    generateAccountNumber: () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }
};

export default accountController;