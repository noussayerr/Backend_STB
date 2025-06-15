import { CreditType } from "../models/type/CreditType.js";
import { CreditApplication } from "../models/applications/CreditApplication.js";
import { Credit } from "../models/Credit.model.js";
import { User } from "../models/user.model.js";
import { BankingAccount } from "../models/Account.model.js";


const creditController = {
    getCreditTypes: async (req, res) => {
        try {
          const creditTypes = await CreditType.find().sort({ createdAt: -1 });
          res.status(200).json(creditTypes);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },
    
    getCreditType: async (req, res) => {
        try {
          const { id } = req.params;
          const creditType = await CreditType.findById(id);
          if (!creditType) {
            return res.status(404).json({ message: "Credit type not found" });
          }
          res.status(200).json(creditType);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },
    
    submitCreditApplication: async (req, res) => {
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
            creditType,
            amountRequested,
            duration,
            purpose,
            rib,
            employmentStatus,
            employerName,
            monthlyIncome,
            otherLoans,
            loanDetails,
            monthlyPayment,
            interestRate
          } = req.body;
      
          // Validate credit type
          const selectedCreditType = await CreditType.findById(creditType);
          if (!selectedCreditType) {
            return res.status(400).json({
              success: false,
              message: 'Invalid credit type'
            });
          }
      
          // Validate amount against credit type requirements
          if (amountRequested < selectedCreditType.requirements.minAmount || 
              amountRequested > selectedCreditType.requirements.maxAmount) {
            return res.status(400).json({
              success: false,
              message: `Amount must be between ${selectedCreditType.requirements.minAmount} and ${selectedCreditType.requirements.maxAmount} DT`
            });
          }
      
          // Validate duration
          if (duration < selectedCreditType.requirements.minTerm || 
              duration > selectedCreditType.requirements.maxTerm) {
            return res.status(400).json({
              success: false,
              message: `Duration must be between ${selectedCreditType.requirements.minTerm} and ${selectedCreditType.requirements.maxTerm} years`
            });
          }
      
          // Handle file upload if present (for bank statement)
          let bankStatementUrl = '';
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
              resource_type: 'auto',
              folder: 'credit-applications'
            });
            bankStatementUrl = result.secure_url;
          }
      
          const application = new CreditApplication({
            user: req.user._id,
            creditType,
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
            creditInfo: {
              amountRequested,
              duration,
              purpose,
              rib,
              monthlyPayment,
              interestRate
            },
            financialInfo: {
              employmentStatus,
              employerName,
              monthlyIncome,
              otherLoans,
              loanDetails
            }
          });
      
          await application.save();
      
          res.status(201).json({
            success: true,
            message: 'Credit application submitted successfully',
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
    
    getUserCreditApplications: async (req, res) => {
        try {
          const applications = await CreditApplication.find({ user: req.user._id })
            .populate('creditType', 'title description interestRate');
            
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
        }
    },
    
    getAllApplications: async (req, res) => {
        try {
          const applications = await CreditApplication.find()
            .populate('user', 'firstName lastName email')
            .populate('creditType', 'title interestRate');
            
          res.status(200).json(applications);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },
    
    getApplicationById: async (req, res) => {
        try {
          const application = await CreditApplication.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('creditType', 'title description interestRate');
            
          if (!application) {
            return res.status(404).json({ message: "Application not found" });
          }
          
          res.status(200).json(application);
        } catch (error) {
          res.status(500).json({ message: "Error fetching application", error: error.message });
        }
    },
    
    updateApplicationStatus: async (req, res) => {
        try {
            const { status, adminNote } = req.body;
            const { id } = req.params;
            
            if (!["pending", "approved", "rejected"].includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            
            const application = await CreditApplication.findByIdAndUpdate(
                id,
                { 
                    status,
                    updatedAt: Date.now(),
                    adminNote: adminNote || undefined
                },
                { new: true }
            );
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            // If approved, create the credit account
            if (status === "approved") {
                await creditController.createCreditFromApplication(application);
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
    
    createCreditFromApplication: async (application) => {
        try {
            const { user, creditType, creditInfo } = application;
            
            // Find user's banking account
            const bankingAccount = await BankingAccount.findOne({ user });
            if (!bankingAccount) {
                throw new Error("User banking account not found");
            }
            
            // Calculate end date
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + creditInfo.duration);
            
            // Create the credit
            const newCredit = new Credit({
                user,
                bankingAccount: bankingAccount._id,
                creditType: creditType._id,
                amount: creditInfo.amountRequested,
                interestRate: creditInfo.interestRate,
                term: creditInfo.duration,
                monthlyPayment: creditInfo.monthlyPayment,
                startDate: new Date(),
                endDate,
                remainingBalance: creditInfo.amountRequested,
                status: 'active'
            });
            
            await newCredit.save();
            
            // Update user's credits
            await User.findByIdAndUpdate(user, {
                $push: { credits: newCredit._id }
            });
            
            return newCredit;
        } catch (error) {
            console.error("Error creating credit from application:", error);
            throw error;
        }
    },
    
    getUserCredits: async (req, res) => {
        try {
            const credits = await Credit.find({ user: req.user._id })
                .populate('creditType', 'title interestRate')
                .populate('bankingAccount', 'accountNumber');
                
            res.status(200).json({
                success: true,
                data: credits
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch credits',
                error: error.message
            });
        }
    }
};

export default creditController;