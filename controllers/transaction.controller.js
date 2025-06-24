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


export const rechargeCardFromAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { cardId, fromAccountId, amount } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!cardId || !fromAccountId || !amount) {
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
      _id: fromAccountId,
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

    // Get recipient card
    const recipientCard = await UserCard.findOne({
      _id: cardId,
      user: userId,
      status: 'active'
    }).session(session);

    if (!recipientCard) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient card not found or not active" });
    }

    // Perform the transfer
    senderAccount.balance -= amount;
    recipientCard.currentBalance += amount;

    // Save all changes
    await Promise.all([
      senderAccount.save({ session }),
      recipientCard.save({ session })
    ]);

    await session.commitTransaction();
    
    res.status(201).json({
      message: "Card recharge successful",
      transaction: {
        amount,
        card: recipientCard,
        account: senderAccount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Card recharge error:", error);
    res.status(500).json({ message: "Card recharge failed", error: error.message });
  } finally {
    session.endSession();
  }
};

export const transferCardToCard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { fromCardId, toCardNumber, amount } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!fromCardId || !toCardNumber || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if amount is valid
    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get sender card (must belong to the authenticated user)
    const senderCard = await UserCard.findOne({
      _id: fromCardId,
      user: userId,
      status: 'active'
    }).session(session);

    if (!senderCard) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sender card not found or not active" });
    }

    // Check if sender card is Carte C Cash
    if (senderCard.cardType.toString() !== CARTE_C_CASH_ID) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Only Carte C Cash cards can transfer" });
    }

    // Check sender balance
    if (senderCard.currentBalance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient card balance" });
    }

    // Get recipient card
    const recipientCard = await UserCard.findOne({
      cardNumber: toCardNumber,
      status: 'active',
      cardType: CARTE_C_CASH_ID
    }).session(session);

    if (!recipientCard) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient card not found or not eligible" });
    }

    // Prevent self-transfer
    if (senderCard._id.equals(recipientCard._id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot transfer to the same card" });
    }

    // Perform the transfer
    senderCard.currentBalance -= amount;
    recipientCard.currentBalance += amount;

    // Save all changes
    await Promise.all([
      senderCard.save({ session }),
      recipientCard.save({ session })
    ]);

    await session.commitTransaction();
    
    res.status(201).json({
      message: "Card transfer successful",
      transaction: {
        amount,
        fromCard: senderCard,
        toCard: recipientCard
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Card transfer error:", error);
    res.status(500).json({ message: "Card transfer failed", error: error.message });
  } finally {
    session.endSession();
  }
};

export const allaccounttransaction= async(req,res)=>{
  try {
    const userId = req.user._id;
    const { accountId, limit = 10, page = 1 } = req.query;

    // Validate accountId
    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    // Find the account
    const account = await BankingAccount.findOne({
      _id: accountId,
      user: userId,
      status: 'active'
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found or not active" });
    }

    // Fetch transactions for the account
    const transactions = await Transaction.find({
      $or: [
        { senderAccount: account._id },
        { recipientAccount: account._id }
      ]
    })
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
}


export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accountId, limit = 10, page = 1 } = req.query;

    // Validate accountId
    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    // Check if the account belongs to the user
    const account = await BankingAccount.findOne({ 
      _id: accountId, 
      user: userId 
    });
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Query for transactions where the account is either sender OR recipient
    const query = {
      $or: [
        { senderAccount: accountId },
        { recipientAccount: accountId }
      ]
    };

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 }
    };

    const transactions = await Transaction.find(query)
      .populate('senderAccount', 'accountNumber')
      .populate('recipientAccount', 'accountNumber')
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort);

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total: totalTransactions,
      page: parseInt(page),
      pages: Math.ceil(totalTransactions / options.limit)
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};