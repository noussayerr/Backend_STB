import { CreditType } from "../models/type/CreditType.js";
import { CreditApplication } from "../models/applications/CreditApplication.js";
import { Credit } from "../models/Credit.model.js";
import { User } from "../models/user.model.js";
import { BankingAccount } from "../models/Account.model.js";
import { Transaction } from "../models/Transaction.model.js";
import mongoose from "mongoose";
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
        interestRate,
        title
      } = req.body;
  
      // Validate credit type exists
      const selectedCreditType = await CreditType.findOne({title:title});
      if (!selectedCreditType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credit type'
        });
      }
      const bankingAccount = await BankingAccount.findOne({accountNumber:rib });
      if (!bankingAccount) {
        return res.status(400).json({
          success: false,
          message: 'Banking account not found for the provided RIB'
        });
      }
      // Create the application with the expected model structure
      const application = new CreditApplication({
        user: req.user._id,
        creditType: selectedCreditType._id,
        bankingAccount: bankingAccount._id, // Assuming user has a bankingAccount reference
        personalInfo: {
          firstName,
          lastName,
          email,
          phone,
          address: address || 'Not provided', // Default if not provided
          city: city || 'Not provided',
          postalCode: postalCode || '',
          dateOfBirth: dateOfBirth || new Date(), // Default if not provided
          idNumber
        },
        creditInfo: {
          amountRequested: parseFloat(amountRequested),
          duration: parseInt(duration),
          purpose,
          rib,
          monthlyPayment: parseFloat(monthlyPayment),
          interestRate: parseFloat(interestRate)
        },
        financialInfo: {
          employmentStatus,
          employerName: employerName || '', // Optional field
          monthlyIncome: parseFloat(monthlyIncome),
          otherLoans: otherLoans || false,
          loanDetails: loanDetails || ''
        }
      });
  
      await application.save();
  
      res.status(201).json({
        success: true,
        message: 'Credit application submitted successfully',
        data: application
      });
    } catch (error) {
      console.error('Error submitting credit application:', error);
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
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { status, adminNote } = req.body;
        const { id } = req.params;
        
        if (!["pending", "approved", "rejected"].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false,
                message: "Invalid status value" 
            });
        }
        
        const application = await CreditApplication.findByIdAndUpdate(
            id,
            { 
                status,
                updatedAt: Date.now(),
                adminNote: adminNote || undefined
            },
            { new: true, session }
        );
        
        if (!application) {
            await session.abortTransaction();
            return res.status(404).json({ 
                success: false,
                message: "Application not found" 
            });
        }
        
        // If approved, create the credit account
        if (status === "approved") {
            await creditController.createCreditFromApplication(application, session);
        }
        
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: `Application ${status} successfully`,
            data: application
        });
        
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        res.status(500).json({ 
            success: false,
            message: "Error updating application", 
            error: error.message 
        });
    } finally {
        await session.endSession();
    }
},

createCreditFromApplication: async (application, session) => {
    try {
        const { user, creditType, creditInfo, bankingAccount } = application;
        
        // Verify banking account belongs to user
        const userAccount = await BankingAccount.findOne({ 
            _id: bankingAccount, 
            user: user 
        }).session(session);
        
        if (!userAccount) {
            throw new Error("Banking account not found or doesn't belong to user");
        }

        // Get current balance before credit disbursement
        const currentBalance = userAccount.balance;
        const principal = parseFloat(creditInfo.amountRequested);

        // Calculate loan details
        const monthlyRate = creditInfo.interestRate / 100 / 12;
        const numberOfPayments = creditInfo.duration * 12;
        const monthlyPayment = parseFloat(
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        ).toFixed(2));

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + numberOfPayments);

        // Create the credit
        const newCredit = new Credit({
            user,
            bankingAccount: bankingAccount,
            creditType: creditType,
            amount: principal,
            interestRate: creditInfo.interestRate,
            term: creditInfo.duration,
            monthlyPayment: monthlyPayment,
            totalPayment: parseFloat(monthlyPayment) * numberOfPayments,
            startDate,
            endDate,
            remainingBalance: parseFloat(monthlyPayment) * numberOfPayments,
            status: 'active',
            paymentSchedule: Array.from({ length: numberOfPayments }, (_, i) => {
                const paymentDate = new Date(startDate);
                paymentDate.setMonth(paymentDate.getMonth() + i + 1);
                return {
                    dueDate: paymentDate,
                    amount: parseFloat(monthlyPayment),
                    status: 'pending'
                };
            })
        });

        await newCredit.save({ session });

        // Update user's banking account with the full credited amount
        await BankingAccount.findByIdAndUpdate(
            bankingAccount,
            { $inc: { balance: currentBalance+principal } },
            { session }
        );

        // Create single deposit transaction
        const creditTransaction = new Transaction({
            senderAccount: null, // System account
            recipientAccount: bankingAccount,
            amount: principal,
            transactionType: 'deposit',
            status: 'completed',
            userBalanceBefore: currentBalance,
            userBalanceAfter: currentBalance + principal,
            description: `Credit disbursement for ${creditInfo.title}`,
            reference: `CREDIT-${newCredit._id}`
        });

        await creditTransaction.save({ session });

        // Update user's credits list
        await User.findByIdAndUpdate(
            user,
            { $push: { credits: newCredit._id } },
            { session }
        );

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
                console.log(credits);
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
    },
    // Add to credit.controller.js

getUserCreditsWithDetails: async (req, res) => {
    try {
        const credits = await Credit.find({ user: req.user._id })
            .populate('creditType', 'title interestRate')
            .populate('bankingAccount', 'accountNumber')
            .sort({ startDate: -1 });

        // Calculate dashboard summary
        const totalBalance = credits.reduce((sum, credit) => sum + (credit.remainingBalance || 0), 0);
        const totalMonthlyPayment = credits.reduce((sum, credit) => sum + (credit.monthlyPayment || 0), 0);
        
        // Calculate next payment date (1st of next month)
        const now = new Date();
        const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        res.status(200).json({
            success: true,
            data: {
                credits,
                summary: {
                    totalBalance,
                    totalMonthlyPayment,
                    nextPayment: totalMonthlyPayment, // Next payment is always the total monthly payment
                    nextPaymentDate, // Single next payment date for all credits
                    activeCredits: credits.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch credits',
            error: error.message
        });
    }
},

getCreditDetails: async (req, res) => {
    try {
        const credit = await Credit.findById(req.params.id)
            .populate('creditType', 'title interestRate description')
            .populate('bankingAccount', 'accountNumber');

        if (!credit) {
            return res.status(404).json({
                success: false,
                message: 'Credit not found'
            });
        }

        res.status(200).json({
            success: true,
            data: credit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch credit details',
            error: error.message
        });
    }
}
};

export default creditController;