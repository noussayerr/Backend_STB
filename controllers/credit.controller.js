import { CreditType } from "../models/type/CreditType.js";
import { CreditApplication } from "../models/applications/CreditApplication.js";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const creidtcontroller = {

    getCreditTypes: async (req, res) => {
        try {
        const creditTypes = await CreditType.find().sort({ createdAt: -1 });
        res.status(200).json(creditTypes);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },
  // Get single credit type
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
    submitCreditApplication : async (req, res) => {
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
            loanDetails
          } = req.body;
      
          // Validate credit type
          const selectedCreditType = await CreditType.findById(creditType);
          if (!selectedCreditType) {
            return res.status(400).json({
              success: false,
              message: 'Invalid credit type'
            });
          }
      
          // Handle file upload if present
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
              bankStatement: bankStatementUrl
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
      getUserCreditApplications : async (req, res) => {
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
      }
};
export default creidtcontroller;