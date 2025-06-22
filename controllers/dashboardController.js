import { User } from "../models/user.model.js";
import { BankingAccount } from "../models/Account.model.js";
import { Transaction } from "../models/Transaction.model.js";
import { Credit } from "../models/Credit.model.js";
import { Reclamation } from "../models/reclamation.model.js";
import { CardApplication } from "../models/applications/CardApplication.js";
import { CreditApplication } from "../models/applications/CreditApplication.js";
import { AccountApplication } from "../models/applications/AccountApplication.js";
import mongoose from "mongoose";

const dashboardController = {
  getDashboardData: async (req, res) => {
    try {
      // Get date ranges for analytics
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Fetch all data in parallel for better performance
      const [
        totalCustomers,
        newCustomersLast30Days,
        activeCustomers,
        totalAccounts,
        totalBalance,
        activeCards,
        recentTransactions,
        hourlyTransactionData,
        accountDistribution,
        customerActivity,
        fraudAttempts,
        pendingApplications,
        creditsData,
        notifications
      ] = await Promise.all([
        // Customer metrics
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: last30Days } }),
        User.countDocuments({ lastLogin: { $gte: last30Days } }),
        
        // Account metrics
        BankingAccount.countDocuments({ status: 'active' }),
        BankingAccount.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: null, total: { $sum: '$balance' } } }
        ]),
        
        // Card metrics
        CardApplication.countDocuments({ status: 'approved' }),
        
        // Transaction data
        Transaction.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('senderAccount', 'accountNumber')
          .populate('recipientAccount', 'accountNumber')
          .populate({
            path: 'senderAccount',
            populate: { path: 'user', select: 'firstName lastName' }
          }),
        
        // Hourly transaction volume
        Transaction.aggregate([
          { 
            $match: { 
              createdAt: { $gte: last7Days },
              status: 'completed' 
            } 
          },
          {
            $group: {
              _id: { $hour: '$createdAt' },
              amount: { $sum: '$amount' }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        
        // Account type distribution
        BankingAccount.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$accountType', count: { $sum: 1 } } },
          { $lookup: {
              from: 'accounttypes',
              localField: '_id',
              foreignField: '_id',
              as: 'accountType'
            }
          },
          { $unwind: '$accountType' },
          { $project: { name: '$accountType.name', value: '$count' } }
        ]),
        
        // Customer activity
        User.aggregate([
          { 
            $match: { 
              $or: [
                { createdAt: { $gte: last90Days } },
                { lastLogin: { $gte: last30Days } }
              ]
            } 
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              newUsers: { 
                $sum: { 
                  $cond: [{ $gte: ['$createdAt', last90Days] }, 1, 0] 
                } 
              },
              activeUsers: { 
                $sum: { 
                  $cond: [{ $gte: ['$lastLogin', last30Days] }, 1, 0] 
                } 
              }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        
        // Fraud attempts
        Reclamation.aggregate([
          { $match: { category: 'fraud' } },
          {
            $group: {
              _id: { $dayOfWeek: '$createdAt' },
              attempts: { $sum: 1 },
              resolved: { 
                $sum: { 
                  $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] 
                } 
              }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        
        // Pending applications
        Promise.all([
          AccountApplication.countDocuments({ status: 'pending' }),
          CardApplication.countDocuments({ status: 'pending' }),
          CreditApplication.countDocuments({ status: 'pending' })
        ]),
        
        // Credits data
        Credit.aggregate([
          { $match: { status: 'active' } },
          { $group: { 
              _id: null, 
              totalAmount: { $sum: '$amount' },
              totalActive: { $sum: 1 }
            } 
          }
        ]),
        
        // Notifications
        Reclamation.find({ status: { $in: ['pending', 'in-progress'] } })
          .sort({ createdAt: -1 })
          .limit(3)
      ]);

      // Process the data for the dashboard
      const processedData = {
        // Key metrics
        totalCustomers,
        newCustomersLast30Days,
        activeCustomers,
        totalAccounts,
        totalAssets: totalBalance[0]?.total || 0,
        activeCards,
        totalActiveCredits: creditsData[0]?.totalActive || 0,
        totalCreditAmount: creditsData[0]?.totalAmount || 0,
        
        // Transaction data
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          user: tx.senderAccount?.user 
            ? `${tx.senderAccount.user.firstName} ${tx.senderAccount.user.lastName}`
            : 'System',
          type: tx.transactionType,
          amount: `${tx.amount.toFixed(2)} DT`,
          time: tx.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: tx.status,
          icon: tx.transactionType === 'deposit' ? 'ArrowUpRight' : 
                tx.transactionType === 'withdrawal' ? 'ArrowDownRight' : 'CreditCard',
          avatar: tx.senderAccount?.user 
            ? `${tx.senderAccount.user.firstName.charAt(0)}${tx.senderAccount.user.lastName.charAt(0)}`
            : 'SY'
        })),
        
        // Charts data
        transactionVolume: Array(24).fill(0).map((_, i) => ({
          time: `${i}:00`,
          amount: hourlyTransactionData.find(h => h._id === i)?.amount || 0
        })),
        
        accountDistribution,
        
        customerActivity: customerActivity.map(ca => ({
          month: new Date(2000, ca._id - 1, 1).toLocaleString('default', { month: 'short' }),
          active: ca.activeUsers,
          new: ca.newUsers
        })),
        
        fraudAttempts: fraudAttempts.map(fa => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][fa._id - 1],
          attempts: fa.attempts,
          blocked: fa.resolved
        })),
        
        // Applications
        pendingApplications: {
          accounts: pendingApplications[0],
          cards: pendingApplications[1],
          credits: pendingApplications[2]
        },
        
        // Notifications
        notifications: notifications.map(notif => ({
          id: notif._id,
          title: notif.subject,
          description: notif.description,
          time: formatTimeDifference(now - new Date(notif.createdAt)),
          read: notif.status === 'resolved'
        }))
      };

      res.status(200).json({
        success: true,
        data: processedData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard data',
        error: error.message
      });
    }
  }
};

// Helper function to format time difference
function formatTimeDifference(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export default dashboardController;