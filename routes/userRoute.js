import express from "express";
import { UserModal } from "../models/userModal.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup",async(req,res)=>{
    try {

    const {name,email,password,imageUrl} = req.body;
    const nameCheck = await UserModal.findOne({name});
    if(nameCheck){
        return res.json({success:false,message:"Name is already taken"});
    }
    const emailCheck = await  UserModal.findOne({email});
    if(emailCheck){
        return res.json({success:false,message:"Email is already taken"});
    }
    const newPassword = await bcrypt.hash(password,10);

    const newUser = await UserModal.create({name,email,password:newPassword,imageUrl});


        const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{ expiresIn: "24h" });
        res.cookie("fztoken",token,{
            httpOnly:true,
            secure:true
        });
        res.json({success:true,message:"User created",user:newUser,userID:newUser._id});  
    } catch (error) {
        res.status(500).json({success:false,message:error.message });
    }
    
});


router.post("/login",async(req,res)=>{
    try {
    const {email,password} = req.body;
    const user = await UserModal.findOne({email});
    if(!user){
        return res.json({success:false,message:"User doesn't exist"});
    }
    const checkPassword = await bcrypt.compare(password,user.password);
    if(!checkPassword){
        return res.json({success:false,message:"Invalid password"});
    }
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{ expiresIn: "24h" });
    res.cookie("fztoken",token,{
        httpOnly:true,
        secure:true
    });
    res.json({success:true,message:"logged in successfully",token:token,userID:user._id});
    
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/logout",async(req,res)=>{
    // console.log("Reading cookie bc",fztoken);
    try {
        const fztoken = req.cookies.fztoken;
        if (!fztoken) {
            return res.status(401).json({ success: false, message: "Already logged out" });
        }
    //const decodeToken = jwt.verify(fztoken,process.env.JWT_SECRET_KEY);
    //const user = await UserModal.findById(decodeToken.userId);
    // if(!user){
    //     return res.json({ success: false, message: "User not found" });
    // }else{
    //     console.log(user);
    //     res.json({success:true,foundUser:user,message:"foundUser"});
    // }
    else{
        res.clearCookie('fztoken');
        res.status(200).json({ success: true, message: 'Logout successful' });
    }
    } catch (error) {
        console.error("Error logginout :", error);
        return res.status(500).json({ success: false, message: "Error in logout" });
    }
});
export {router as userRouter};