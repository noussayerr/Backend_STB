import {User} from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import { sendVerificationEmail,sendPasswordResetEmail,sendResetSuccessEmail } from "../mails/emails.js"
import { generateTokenAndSetCookie } from "../utils/generatetokenandsetcookie.js"
import crypto from "crypto"
const auth={
    signup:async(req,res)=>{
        const {firstName,lastName,gender,country,state,city,maritalStatus,socioProfessionalStatus,age,email,password}=req.body
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
            if(!user.isverified){
                return res.status(400).json ({success:false ,message: "user not verified"})
            }
            const ispasswordvalid = await bcryptjs.compare (password,user.password)
            if(!ispasswordvalid){
                return res.status(400).json ({success:false,message:"That's not the right password"})
            }
            generateTokenAndSetCookie(res,user._id)

            user.lastLogin=new Date();

            await user.save ();

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