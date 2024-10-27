import express from "express";
import { UserModal } from "../models/userModal.js";
import jwt from 'jsonwebtoken';
import { isLoggedIn } from "../middleware/userMiddleware.js";
import { campaignModal } from "../models/CampaignModal.js";

const router = express.Router();

router.get("/details",async(req,res)=>{
    const fztoken = req.cookies.fztoken;
    if (!fztoken) {
        return res.status(401).json({ success: false, message: "JWT not provided" });
    }
    console.log("Reading cookie bc",fztoken);
    try {
    const decodeToken = jwt.verify(fztoken,process.env.JWT_SECRET_KEY);
    const user = await UserModal.findById(decodeToken.userId);
    if(!user){
        return res.json({ success: false, message: "User not found" });
    }else{
        console.log(user);
        res.json({success:true,user:user,message:"foundUser"});
    }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


router.get("/profile",isLoggedIn,async(req,res)=>{
    try {
        const user = req.user;
        console.log(user);
        return res.json({success:true,message:user});
        
    } catch (error) {
        
    }
});


router.get("/favourites",isLoggedIn,async(req,res)=>{
    try {
        console.log("it will work");

        const followingCampaignsData = req.user.followingCampaigns;
        console.log("followingCampaignsData", followingCampaignsData);
        return res.json({ success: true, message: followingCampaignsData });
        
    } catch (error) {
        return res.json({ success: true, message: "loadScreen" });
    }
});

router.put("/updateProfile",isLoggedIn,async(req,res)=>{
    try {
    const {name,email,imageUrl} = req.body;
    req.user.email = email;
    req.user.name = name;
    req.user.imageUrl = imageUrl;
    await req.user.save();
    return res.status(200).json({success:false,message:"User updated successfully"});
    } catch (error) {
        console.error("Error in updating:", error);
        return res.status(500).json({success:false,message:error});
    }
});

export {router as detailsRouter};