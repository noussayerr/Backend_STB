import {Cart} from "../models/cart.model.js"

const cart={
    createcart:async(req,res)=>{
        const {bankingAccount}=req.body
        try{
            const cart=new Cart({
                user:req.user._id,
                bankingAccount,
                type:"cart"
            })
            await cart.save()
            res.status(201).json({
                success:true,
                message:"cart created",
                cart
            })
        }catch(error){
            res.status(400).json({success:false,message:error.message})
        }
    },
    getcart:async(req,res)=>{
        try{
            const cart=await Cart.findOne({user:req.user._id,type:"cart"})
            if(!cart){
                return res.status(404).json({success:false,message:"cart not found"})
            }
            res.status(200).json({
                success:true,
                cart
            })
        }catch(error){
            res.status(400).json({success:false,message:error.message})
        }},
    getcartbyid:async(req,res)=>{
            try{
                const cart=await Cart.findById(req.params.id)
                if(!cart){
                    return res.status(404).json({success:false,message:"cart not found"})
                }
                res.status(200).json({
                    success:true,
                    cart
                })
            }catch(error){
                res.status(400).json({success:false,message:error.message})
            }
        },
    block_andunblock_cart:async(req,res)=>{
        try{
            const cart=await Cart.findById(req.params.id)
            if(!cart){
                return res.status(404).json({success:false,message:"cart not found"})
            }
            cart.isblocked=!cart.isblocked
            await cart.save()
            res.status(200).json({
                success:true,
                cart
            })
        }catch(error){
            res.status(400).json({success:false,message:error.message})
        }
    },
    
}
export default cart;