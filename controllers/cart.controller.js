
import {CardApplication} from '../models/applications/CardApplication.js'
import { CardType } from '../models/type/CardType.js';
import {UserCard} from '../models/UserCard.js';
import { BankingAccount } from '../models/Account.model.js';
import { User } from '../models/user.model.js';
import { Transaction } from '../models/Transaction.model.js';
import notificationController from './notificationController.js';
import {generateCardNumber,  generateRandomNumber } from '../utils/generatenumber.js';
const cardController = {

  getCardTypes: async (req, res) => {
    try {
      const cardTypes = await CardType.find();
      res.status(201).json(cardTypes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCardTypeById: async (req, res) => {
    try {
      const cardType = await CardType.findById(req.params.id);
      res.json(cardType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // User card application
  submitApplication: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        cardType,
        cardHolderName,
        deliveryAddress,
        deliveryCity,
        deliveryPostalCode,
        employmentStatus,
        employerName,
        monthlyIncome,
        bankingAccount
      } = req.body;
      const userid=req.user._id.toString();
      const account = await BankingAccount.findOne({ accountNumber: bankingAccount });
      const application = new CardApplication({
        user: userid,
        cardType,
        bankingAccount:account._id,
        personalInfo: {
          firstName,
          lastName, 
          email,
          phone, 
        },
        cardInfo: {
          cardHolderName,
          deliveryAddress,
          deliveryCity,
          deliveryPostalCode
        },
        employmentInfo: {
          status: employmentStatus,
          employerName,
          monthlyIncome
        }
      });
      console.log(application);
      await application.save();
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
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
  // Get user's cards
  getUserCards: async (req, res) => {
    try {
      const cards = await UserCard.find({ user: req.user._id })
        .populate('cardType');
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Block/unblock card
  toggleCardBlock: async (req, res) => {
    try {
      const card = await UserCard.findById(req.params.id);
      card.status = card.status === 'active' ? 'blocked' : 'active';
      await card.save();
      res.json(card);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  allapplication:async(req,res)=>{
    
    try {
      const cardApplication = await CardApplication.find();
      res.status(201).json(cardApplication);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  
  processApplication: async (req, res) => {
        try {
            const { applicationId } = req.params;
            const { status, adminNotes } = req.body;

            const application = await CardApplication.findById(applicationId)
                .populate('user')
                .populate('bankingAccount');

            if (!application) {
                return res.status(404).json({ message: 'Application not found' });
            }

            if (application.status !== 'pending') {
                return res.status(400).json({ message: 'Application has already been processed' });
            }

            application.status = status;
            application.adminNotes = adminNotes;
            application.processedAt = new Date();

            const cardType = await CardType.findById(application.cardType);

            if (status === 'approved') {
                const cardNumber = generateCardNumber();
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 3);
                const cvv = generateRandomNumber(3);
                const pin = generateRandomNumber(4);

                const newCard = new UserCard({
                    user: application.user._id,
                    bankingAccount: application.bankingAccount._id,
                    cardType: application.cardType._id,
                    cardNumber,
                    expiryDate,
                    cvv,
                    pin,
                    status: 'active',
                    currentBalance: 0,
                    fees: {
                        annual: cardType.fees.annual,
                        withdrawal: cardType.fees.withdrawal,
                        replacement: cardType.fees.replacement
                    }
                });
                await newCard.save();

                await Promise.all([
                    BankingAccount.findByIdAndUpdate(
                        application.bankingAccount._id,
                        { $push: { cards: newCard._id } }
                    ),
                    User.findByIdAndUpdate(
                        application.user._id,
                        { $push: { carts: newCard._id } } // Assuming 'carts' is the field for user cards
                    )
                ]);

                const feeTransaction = new Transaction({
                    user: application.user._id,
                    bankingAccount: application.bankingAccount._id,
                    amount: cardType.fees.annual,
                    transactionType: 'fee',
                    description: 'Annual card fee',
                    status: 'completed'
                });

                await BankingAccount.findByIdAndUpdate(
                    application.bankingAccount._id,
                    { $inc: { balance: -cardType.fees.annual } }
                );
                await feeTransaction.save();
                await application.save();

                // --- Send Notification for Approved Card ---
                await notificationController.sendPushNotification(
                    application.user._id,
                    'Card Application Approved!',
                    `Good news! Your ${cardType.name} card application has been approved. Your new card details are ready.`,
                    { screen: 'View/pack', cardId: newCard._id.toString() } // Example data to navigate to card details
                );
                // ------------------------------------------

                return res.status(200).json({
                    message: 'Application approved and card created successfully',
                    application,
                    card: newCard
                });
            } else if (status === 'rejected') { // Handle rejection
                await application.save();
                // --- Send Notification for Rejected Card ---
                await notificationController.sendPushNotification(
                    application.user._id,
                    'Card Application Rejected',
                    `Your card application has been rejected. Admin notes: ${adminNotes || 'No specific reason provided.'}`,
                    { screen: 'View/settings' } // Example data to navigate to settings or application history
                );
                // ------------------------------------------
                return res.status(200).json({
                    message: 'Application rejected successfully',
                    application
                });
            }

            await application.save();
            res.status(200).json({
                message: 'Application processed successfully',
                application
            });
        } catch (error) {
            console.error('Application processing error:', error);
            res.status(500).json({
                message: 'Error processing application',
                error: error.message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        }
    }
};
export default cardController