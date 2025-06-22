import {User} from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import { sendVerificationEmail,sendPasswordResetEmail,sendResetSuccessEmail } from "../mails/emails.js"
import { generateTokenAndSetCookie } from "../utils/generatetokenandsetcookie.js"
import crypto from "crypto"

import { AccountApplication } from "../models/applications/AccountApplication.js";
import {CardApplication} from '../models/applications/CardApplication.js'
import { Reclamation } from "../models/reclamation.model.js";
import { CreditApplication } from "../models/applications/CreditApplication.js";

const auth={
    
    signup:async(req,res)=>{
        const {firstName,lastName,gender,country,state,city,maritalStatus,socioProfessionalStatus,age,email,password,rib}=req.body
        try{
            if (!email || !password|| !firstName || !lastName|| !gender || !country|| !state || !city|| !maritalStatus || !socioProfessionalStatus|| !age ){
                throw new Error ("all fields are required");
            }
            
            const existeduser=await User.findOne({email})
            if(existeduser){
                return res.status(400).json({success:false,message:"User already exists"});
            }
            const hashedpassword = await bcryptjs.hash (password,10);
            const verificationToken=Math.floor(100000  + Math.random()*900000).toString()
            const user = new User({
                email,
                password:hashedpassword,
                firstName,
                lastName,
                age,
                gender,
                country,
                state,
                city,
                maritalStatus,
                socioProfessionalStatus,
                verificationToken,
                verificationTokenExpiresAt : Date.now() + 24 * 60 * 60 * 1000
            })
            await user.save();
            generateTokenAndSetCookie(res,user._id)
            
            sendVerificationEmail(user.email,verificationToken)
            res.status(201).json({
                success:true,
                message:"user created",
                user:{
                    ...user._doc,
                    password:undefined
                }
            })
        }catch(error){
            res.status(400).json({success:false,message:error.message});
        }
    },
    verifyemail:async(req,res)=>{ 
        const {verificationCode}=req.body;
        console.log(verificationCode);
        try {
            const user =await User.findOne({
                verificationToken:verificationCode,
                verificationTokenExpiresAt:{$gt : Date.now()}
            })
            console.log(user);
            if (!user){
               return res .status(400).json ({success:false,message:"invalide or expired verification code"}) 
            }

            user.isVerified=true
            user.verificationToken=undefined;
            user.verificationTokenExpiresAt=undefined;

            await user.save();

            //await sendwelcomemail(user.email,user.name);
            res.status(200).json({
                success: true,
                message: "Email verified successfully",
                user: {
                    ...user._doc,
                    password: undefined,
                },
            });
        }
        catch(error){
            console.log("error in verifyEmail ", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
    logout: async (req,res)=>{
        res.clearCookie ("token");
        res.status(200).json ({success : true , message : "logged out successfully "});  
    },
    login:async(req,res)=>{
        
        const {email,password}=req.body

        try {

            const user = await User.findOne({email});
            if (!user){
                return res.status(400).json ({success:false ,message: "Invalide credentials"})
            }
            if(!user.isVerified){
                return res.status(400).json ({success:false ,message: "user not verified"})
            }
            const ispasswordvalid = await bcryptjs.compare (password,user.password)
            if(!ispasswordvalid){
                return res.status(400).json ({success:false,message:"That's not the right password"})
            }
            const token=generateTokenAndSetCookie(res,user._id)
            
            user.lastLogin=new Date();

            await user.save ();

            res.status(200).json({
                success: true,
                message: "Email verified successfully",
                token,
                user: {
                    ...user._doc,
                    password: undefined,
                },
            });
        }
        catch(error){
            console.log("error in login ", error);
            res.status(500).json({ success: false, message: "login error" });
        }
    },
    forgotpassword:async(req,res)=>{
        const {email}=req.body

        try {
            const user=await User.findOne({email})
            if (!user){
                return res.status(400).json({ success:false , message: " user not found " })
            }
            
            const resettoke=crypto.randomBytes(20).toString("hex")
            const resetTokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000
            user.resetPasswordtoken=resettoke;
            user.resetPasswordexpiresat=resetTokenExpiresAt;

            await user.save()

            await sendPasswordResetEmail(user.email,`${process.env.user_url}/reset_password/${resettoke}`)
            
            res.status(200).json({ success: true, message: "Password reset link sent to your email" });
            
        } 
        catch (error) {
            console.log("Error in forgotPassword ", error);
            res.status(400).json({ success: false, message: error.message });
        }
    
    },
    resetpassword : async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
    
            const user = await User.findOne({
                resetPasswordtoken: token,
                resetPasswordexpiresat: { $gt: Date.now() },
            });
            console.log(user)
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
            }
    
            // update password
            const hashedPassword = await bcryptjs.hash(password, 10);
    
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiresAt = undefined;
            await user.save();
    
            await sendResetSuccessEmail(user.email);
    
            res.status(200).json({ success: true, message: "Password reset successful" });
        } catch (error) {
            console.log("Error in resetPassword ", error);
            res.status(400).json({ success: false, message: error.message });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, email } = req.body;
            const userId = req.user._id;

            // Validate input
            if (!firstName || !lastName || !email) {
                return res.status(400).json({ success: false, message: "First name, last name and email are required" });
            }

            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already taken" });
            }

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { 
                    firstName,
                    lastName,
                    email,
                    updatedAt: Date.now()
                },
                { new: true, select: '-password' }
            );

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: updatedUser
            });
        } catch (error) {
            console.log("Error in updateProfile ", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    /**
     * Get all applications for the current user
     */
    getUserApplications: async (req, res) => {
        try {
            const userId = req.user._id;

            // Fetch all applications in parallel
            const [accountApps, cardApps, creditApps] = await Promise.all([
                AccountApplication.find({ user: userId }),
                CardApplication.find({ user: userId }),
                CreditApplication.find({ user: userId })
            ]);

            // Transform the data to match the frontend structure
            const transformApplication = (app, type) => {
                let transformed = {
                    id: app._id.toString(),
                    type,
                    title: '',
                    status: app.status,
                    date: app.createdAt.toISOString(),
                    description: '',
                    requestNumber: app._id.toString().slice(-6).toUpperCase() // Simple request number from ID
                };

                // Set title and description based on application type
                if (type === 'account') {
                    transformed.title = `Account Opening - ${app.accountType}`;
                    transformed.description = `Application for a new ${app.accountType} account`;
                    if (app.accountInfo?.initialDeposit) {
                        transformed.amount = `$${app.accountInfo.initialDeposit} initial deposit`;
                    }
                } else if (type === 'card') {
                    transformed.title = `Card Application - ${app.cardType}`;
                    transformed.description = `Application for a new ${app.cardType} card`;
                } else if (type === 'credit') {
                    transformed.title = `Credit Application - ${app.creditType}`;
                    transformed.description = `Application for ${app.creditType} credit`;
                    if (app.creditInfo?.amountRequested) {
                        transformed.amount = `$${app.creditInfo.amountRequested} requested`;
                    }
                }

                return transformed;
            };

            // Combine all applications
            const allApplications = [
                ...accountApps.map(app => transformApplication(app, 'account')),
                ...cardApps.map(app => transformApplication(app, 'card')),
                ...creditApps.map(app => transformApplication(app, 'credit'))
            ];

            // Sort by date (newest first)
            allApplications.sort((a, b) => new Date(b.date) - new Date(a.date));

            res.status(200).json({
                success: true,
                applications: allApplications
            });
        } catch (error) {
            console.log("Error in getUserApplications ", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    /**
     * Get application details by ID and type
     */
    getApplicationDetails: async (req, res) => {
        try {
            const { id, type } = req.params;
            const userId = req.user._id;

            let application;
            let applicationType;

            // Fetch application based on type
            switch (type) {
                case 'account':
                    application = await AccountApplication.findOne({ _id: id, user: userId });
                    applicationType = 'Account';
                    break;
                case 'card':
                    application = await CardApplication.findOne({ _id: id, user: userId });
                    applicationType = 'Card';
                    break;
                case 'credit':
                    application = await CreditApplication.findOne({ _id: id, user: userId });
                    applicationType = 'Credit';
                    break;
                default:
                    return res.status(400).json({ success: false, message: "Invalid application type" });
            }

            if (!application) {
                return res.status(404).json({ success: false, message: "Application not found" });
            }

            // Format the response to match frontend needs
            const response = {
                id: application._id,
                type,
                title: `${applicationType} Application`,
                status: application.status,
                date: application.createdAt.toISOString(),
                requestNumber: application._id.toString().slice(-6).toUpperCase(),
                description: `Details of your ${applicationType.toLowerCase()} application`,
                personalInfo: application.personalInfo,
                adminNotes: application.adminNotes || application.adminNote || 'No notes available'
            };

            // Add type-specific fields
            if (type === 'account') {
                response.accountInfo = application.accountInfo;
                response.financialInfo = application.financialInfo;
                if (application.accountInfo?.initialDeposit) {
                    response.amount = `$${application.accountInfo.initialDeposit}`;
                }
            } else if (type === 'card') {
                response.cardInfo = application.cardInfo;
                response.employmentInfo = application.employmentInfo;
            } else if (type === 'credit') {
                response.creditInfo = application.creditInfo;
                response.financialInfo = application.financialInfo;
                if (application.creditInfo?.amountRequested) {
                    response.amount = `$${application.creditInfo.amountRequested}`;
                }
            }

            res.status(200).json({
                success: true,
                application: response
            });
        } catch (error) {
            console.log("Error in getApplicationDetails ", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
    checkAuth : async (req, res) => {
        try {
            const user = await User.findById(req.user._id).select("-password");
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, user });
        } catch (error) {
            console.log("Error in checkAuth ", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default auth