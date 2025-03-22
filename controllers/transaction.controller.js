import {Cart} from "../models/cart.model.js"
import {Transaction} from "../models/transaction.model.js"
import {BankingAccount} from "../models/bankingAccount.model.js"
import {User} from "../models/user.model.js"
const transaction = {
    transaction_compte_a_compte: async (req, res) => {
        try {
            const {cart, amount, bankingAccount} = req.body
            const cart_ = await Cart.findById(cart)
            if (!cart_) {
                return res.status(404).json({success: false, message: "cart not found"})
            }
            const bankingAccount_ = await BankingAccount.findById(bankingAccount)
            if (!bankingAccount_) {
                return res.status(404).json({success: false, message: "banking account not found"})
            }
            const user = await User.findById(req.user._id)
            if (!user) {
                return res.status(404).json({success: false, message: "user not found"})
            }
            const transaction = new Transaction({
                user: req.user._id,
                cart,
                bankingAccount,
                amount,
                transactionType: "cart"
            })
            await transaction.save()
            res.status(201).json({
                success: true,
                transaction})
        } catch (error) {
            res.status(400).json({success: false, message: error.message})
        }
    },
    list_of_transactions: async (req, res) => {
        try {
            const transactions = await Transaction.find({user: req.user._id})
            res.status(200).json({
                success: true,
                transactions
            })
        } catch (error) {
            res.status(400).json({success: false, message: error.message})
        }
    },
    list_of_transactions_by_cart: async (req, res) => {
        try {
            const transactions = await Transaction.find({cart: req.params.id})
            res.status(200).json({
                success: true,
                transactions
            })
        } catch (error) {
            res.status(400).json({success: false, message: error.message})
        }
    },
    list_of_transactions_by_bankingAccount: async (req, res) => {
        try {
            const transactions = await Transaction.find({bankingAccount: req.params.id})
            res.status(200).json({
                success: true,
                transactions
            })
        } catch (error) {
            res.status(400).json({success: false, message: error.message})
        }
    }
}