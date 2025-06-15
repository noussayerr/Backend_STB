import { Transaction } from "../models/Transaction.model.js";
import { BankingAccount } from "../models/Account.model.js";
import mongoose from "mongoose";

export const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { senderAccountId, recipientAccountNumber, amount, description } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate input
    if (!senderAccountId || !recipientAccountNumber || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if amount is valid
    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get sender account (must belong to the authenticated user)
    const senderAccount = await BankingAccount.findOne({
      _id: senderAccountId,
      user: userId,
      status: 'active'
    }).session(session);

    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sender account not found or not active" });
    }

    // Check sender balance
    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient funds" });
    }
    // Get recipient account
    const recipientAccount = await BankingAccount.findOne({
      accountNumber: recipientAccountNumber,
      status: 'active'
    }).populate('accountType').session(session);

    if (!recipientAccount) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient account not found or not active" });
    }

    console.log("Recipient Account Type:", recipientAccount);
    if (!recipientAccount.accountType) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient account has invalid account type" });
    }



    // Prevent self-transfer
    if (senderAccount._id.equals(recipientAccount._id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    // Generate reference
    const reference = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Create transaction record
    const transaction = new Transaction({
      senderAccount: senderAccount._id,
      recipientAccount: recipientAccount._id,
      amount,
      description,
      reference,
      status: 'pending'
    });

    // Perform the transfer
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;
    transaction.status = 'completed';

    // Save all changes
    await Promise.all([
      senderAccount.save({ session }),
      recipientAccount.save({ session, omitUndefined: true }),
      transaction.save({ session })
    ]);

    await session.commitTransaction();
    
    res.status(201).json({
      message: "Transfer successful",
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        reference: transaction.reference,
        date: transaction.createdAt,
        recipient: {
          name: recipientAccount.user.name, // Assuming user is populated
          accountNumber: recipientAccount.accountNumber
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Transfer failed", error: error.message });
  } finally {
    session.endSession();
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accountId, limit = 10, page = 1 } = req.query;

    const query = {
      $or: [
        { senderAccount: accountId },
        { recipientAccount: accountId }
      ]
    };

    const transactions = await Transaction.find(query)
      .populate('senderAccount', 'accountNumber')
      .populate('recipientAccount', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};