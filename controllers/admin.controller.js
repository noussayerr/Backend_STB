import { CardType } from "../models/type/CardType.js";
import { AccountType } from "../models/type/AccountType.js";
import { CreditType } from "../models/type/CreditType.js";
import { CardApplication } from "../models/applications/CardApplication.js";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adminroutes = {
  //cart type
  createCardType: async (req, res) => {
    try {
      const {
        name,
        description,
        tag,
        features,
        benefits,
        fees,
        requirements,
        image,
      } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      const photoUrl = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      const cardType = new CardType({
        name,
        description,
        imageUrl: photoUrl.secure_url,
        tag,
        features: features,
        fees: {
          annual: parseFloat(fees.annual),
          withdrawal: parseFloat(fees.withdrawal),
          replacement: parseFloat(fees.replacement),
        },
        requirements: {
          minIncome: requirements.minIncome
            ? parseFloat(requirements.minIncome)
            : null,
          employmentStatus: requirements.employmentStatus,
        },
        benefits: benefits,
      });

      await cardType.save();
      res.status(201).json(cardType);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack,
      });
    }
  },
  updateCardType: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const existingCard = await CardType.findById(id);
      if (!existingCard) {
        return res.status(404).json({ message: "Card not found" });
      }
  
      // Handle image update
      let imageUrl = existingCard.imageUrl;
      if (updates.image && updates.image !== existingCard.imageUrl) {
        const uploadedImage = await cloudinary.uploader.upload(updates.image, {
          folder: "products"
        });
        imageUrl = uploadedImage.secure_url;
      }
  
      const updatedCard = await CardType.findByIdAndUpdate(id, {
        ...updates,
        imageUrl,
        fees: {
          annual: parseFloat(updates.fees.annual),
          withdrawal: parseFloat(updates.fees.withdrawal),
          replacement: parseFloat(updates.fees.replacement)
        },
        requirements: {
          minIncome: parseFloat(updates.requirements.minIncome),
          employmentStatus: updates.requirements.employmentStatus
        }
      }, { new: true });
  
      res.status(200).json(updatedCard);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack
      });
    }
  },
  // Delete card type
  deleteCardType: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCard = await CardType.findByIdAndDelete(id);
      if (!deletedCard) {
        return res.status(404).json({ message: "Card type not found" });
      }
      
      // Delete image from Cloudinary if it exists
      if (deletedCard.imageUrl) {
        const publicId = deletedCard.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
      
      res.status(200).json({ message: "Card type deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  //account
  createAccountType: async (req, res) => {
    try {
      const {
        name,
        description,
        features,
        benefits,
        requirements,
        fees,
        interestRate,
        icon,
      } = req.body;
      const accountType = new AccountType({
        name,
        description,
        features: features,
        benefits: benefits,
        icon: icon,
        requirements: {
          minDeposit: parseFloat(requirements.minDeposit),
          minBalance: requirements.minBalance ? parseFloat(requirements.minBalance) : null,
        },
        fees: {
          monthly: parseFloat(fees.monthly),
          transaction: fees.transaction ? parseFloat(fees.transaction) : null,
          internationalTransfer: fees.internationalTransfer ? parseFloat(fees.internationalTransfer) : null,
        },
        interestRate: interestRate ? parseFloat(interestRate) : null,
      });
      await accountType.save();
      res.status(201).json(accountType);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack,
      });
    }
  },

  updateAccountType: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const existingAccount = await AccountType.findById(id);
      if (!existingAccount) {
        return res.status(404).json({ message: "Account type not found" });
      }

      // Handle image update
      let imageUrl = existingAccount.imageUrl;
      if (updates.image && updates.image !== existingAccount.imageUrl) {
        const uploadedImage = await cloudinary.uploader.upload(updates.image, {
          folder: "accounts"
        });
        imageUrl = uploadedImage.secure_url;
      }

      const updatedAccount = await AccountType.findByIdAndUpdate(id, {
        ...updates,
        imageUrl,
        requirements: {
          minDeposit: parseFloat(updates.requirements.minDeposit),
          minBalance: updates.requirements.minBalance ? parseFloat(updates.requirements.minBalance) : null,
        },
        fees: {
          monthly: parseFloat(updates.fees.monthly),
          transaction: updates.fees.transaction ? parseFloat(updates.fees.transaction) : null,
          internationalTransfer: updates.fees.internationalTransfer ? parseFloat(updates.fees.internationalTransfer) : null,
        },
        interestRate: updates.interestRate ? parseFloat(updates.interestRate) : null,
      }, { new: true });

      res.status(200).json(updatedAccount);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack
      });
    }
  },

  deleteAccountType: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedAccount = await AccountType.findByIdAndDelete(id);
      if (!deletedAccount) {
        return res.status(404).json({ message: "Account type not found" });
      }
      res.status(200).json({ message: "Account type deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  //credit
  createCreditType: async (req, res) => {
    try {
      const {
        title,
        description,
        interestRate,
        duration,
        eligibility,
        icon,
        color,
        features,
        benefits,
        requirements,
        fees
      } = req.body;
  
      const creditType = new CreditType({
        title,
        description,
        interestRate: parseFloat(interestRate),
        duration,
        eligibility,
        icon,
        color,
        features: features || [],
        benefits: benefits || [],
        requirements: {
          minIncome: requirements?.minIncome ? parseFloat(requirements.minIncome) : null,
          minCreditScore: requirements?.minCreditScore ? parseInt(requirements.minCreditScore) : null,
          employmentDuration: requirements?.employmentDuration || null
        },
        fees: {
          processing: fees?.processing ? parseFloat(fees.processing) : null,
          latePayment: fees?.latePayment ? parseFloat(fees.latePayment) : null,
          prepayment: fees?.prepayment ? parseFloat(fees.prepayment) : null
        }
      });
  
      await creditType.save();
      res.status(201).json(creditType);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack,
      });
    }
  },
  
  // Update credit type
  updateCreditType: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const existingCredit = await CreditType.findById(id);
      if (!existingCredit) {
        return res.status(404).json({ message: "Credit type not found" });
      }
  
      const updatedCredit = await CreditType.findByIdAndUpdate(id, {
        ...updates,
        interestRate: parseFloat(updates.interestRate),
        requirements: {
          minIncome: updates.requirements?.minIncome ? parseFloat(updates.requirements.minIncome) : null,
          minCreditScore: updates.requirements?.minCreditScore ? parseInt(updates.requirements.minCreditScore) : null,
          employmentDuration: updates.requirements?.employmentDuration || null
        },
        fees: {
          processing: updates.fees?.processing ? parseFloat(updates.fees.processing) : null,
          latePayment: updates.fees?.latePayment ? parseFloat(updates.fees.latePayment) : null,
          prepayment: updates.fees?.prepayment ? parseFloat(updates.fees.prepayment) : null
        }
      }, { new: true });
  
      res.status(200).json(updatedCredit);
    } catch (error) {
      res.status(400).json({
        message: error.message,
        error: error.stack
      });
    }
  },
  
  // Delete credit type
  deleteCreditType: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCredit = await CreditType.findByIdAndDelete(id);
      if (!deletedCredit) {
        return res.status(404).json({ message: "Credit type not found" });
      }
      res.status(200).json({ message: "Credit type deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  
  
};

export default adminroutes;