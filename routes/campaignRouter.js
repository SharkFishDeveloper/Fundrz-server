import express from "express";
import { campaignModal } from "../models/CampaignModal.js";
import { UserModal } from "../models/userModal.js";
import mongoose from "mongoose";
//const ObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();

router.post("/create-campaign",async(req,res)=>{
    const {requestData} = req.body;
    console.log("reqdatad",requestData);
    console.log("requestData.ownerName",requestData.ownerName);
    console.log("requestData.ownerEmail",requestData.ownerEmail);
    try {
        if(req.user.name!==requestData.ownerName){
            //throw new Error("Enter the name by which you logged in!");
            return res.json({success:false,message:"Enter name by which you logged in !"})
        }
        if(req.user.email!==requestData.ownerEmail){
            return res.json({success:false,message:"Enter email by which you logged in !"})
        }

        try {
            const foundCampaign = await campaignModal.findOne({
                campaignName:requestData.campaignName
            });
            if(foundCampaign){
                //throw new Error("Name is already taken");
                return res.status(500).json({success:false,message:"Name is already taken"});
            }
            const campaign = await campaignModal.create({
                campaignName: requestData.campaignName,
                campaignSubject: requestData.campaignSubject,
                participants: requestData.participants,
                description: requestData.description,
                imageUrl: requestData.imageUrl,
                campaignAddress:requestData.campaignAddress,
                ownerAddress: requestData.ownerAddress,
                ownerName:requestData.ownerName,
                ownerEmail: requestData.ownerEmail,
                selectedCountry: requestData.selectedCountry,
                selectedState: requestData.selectedState,
                helpEmail: requestData.helpEmail,
                donationTarget: requestData.donationTarget,
            });
            const campaignId = campaign._id;
            console.log("req.user",req.user);//! see if it really works??
            try {
                req.user.createdCampaigns.push({
                    _id:campaignId,
                    campaignImage:requestData.imageUrl,
                    campaignDesc:requestData.description,
                    campaignDate:Date.now(),
                    campaignLoc:requestData.selectedCountry
                });
                await req.user.save({validateBeforeSave:false});
            } catch (error) {
                console.log("error in storing campaign id",error);
            }

            return res.json({
                success: true,
                message: "Campaign created successfully",
                campaign,
              });

        } catch (error) {
            return res.status(500).json({ success: false, message: error });
        }
    } catch (error) {
        console.error(error); 
        return res.json({success:false,message:error})
    }
});


router.get("/details",async(req,res)=>{
try {
    const campaigns = await campaignModal.find();
    return res.status(200).json({success:true,campaigns:campaigns});
} catch (error) {
    console.error(error);
        res.status(500).json({ error: 'Error in retreiving cmapaign details' });
}
});

router.get("/details/:_id",async(req,res)=>{
    let {_id} = req.params;
    try {
        _id = _id.trim();
        const campaign = await campaignModal.findOne({_id});
        if(!campaign){
            return res.status(404).json({ success: false, message: "Campaign not found" }); 
        }
        console.log("fetching fav campaign",campaign);
        return res.json({success: true,campaigns:campaign});
    } catch (error) {
        console.error("Error fetching campaign details:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.put("/edit/upvote",async(req,res)=>{
    try {
        const { campaignId } = req.body;
        const campgn = await campaignModal.findOne({_id:campaignId});
        if (!campgn) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }
        const userFind = await campgn.likedPerson.indexOf(req.user._id);
        if(userFind!==-1){
            return res.status(500).json({ success: false, message: "You have already liked it !" }); 
        }
        campgn.likedPerson.push(req.user._id);
        campgn.upvotes = campgn.upvotes + 1;
        await campgn.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: "Campaign successfully upvoted", campaignId });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.put("/edit/downvote",async(req,res)=>{
    try {
        const { campaignId } = req.body;
        const campgn = await campaignModal.findOne({_id:campaignId});
        if (!campgn) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }
        const userFind = await campgn.dislikedPerson.indexOf(req.user._id);
        if(userFind!==-1){
            return res.status(500).json({ success: false, message: "You have already disliked it !" }); 
        }
        campgn.dislikedPerson.push(req.user._id);
        campgn.downvotes = campgn.downvotes + 1;
        await campgn.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: "Campaign successfully downvoted", campaignId });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
})
router.put("/edit/comment",async(req,res)=>{
    console.error("worked:");
    try {
        const {textAreaComment,campaignId} = req.body;
        console.log("this is textAreaComment",textAreaComment);
        const campaign  = await campaignModal.findOne({_id:campaignId});
        let userHasCommented = false;
        // Iterate over comments to check if the user has already commented
        console.log(req.user._id);
        for (let i = 0; i < campaign.comments.length; i++) {
                console.log("In for loop");
                const comment = campaign.comments[i];
                console.log("dv",comment.name);
                console.log("userId",comment.userId);

                if (comment.userId.toString()===req.user._id.toString()) {
                    
                    
                try {

                    comment.text = textAreaComment;
                    comment.date = new Date();
                    console.log("Commented user found");

                    await campaign.save({ validateBeforeSave: false });
                    return res.status(200).json({success:true,message:"Successfully edited comment"});
                } catch (error) {
                   return res.status(400).json({success:false,message:"Error in editing comment"}); 
                }               
                break;
            }
        }
            if(!userHasCommented){
                try {
                            campaign.comments.push({
                            userId:req.user._id,
                            date: new Date(),
                            text: textAreaComment,
                            name:req.user.name
                    });
                    await campaign.save({ validateBeforeSave: false });
                    return res.status(200).json({success:true,message:"Successfully  commented"});
                } catch (error) {
                    console.error("Error in commenting:", error);
                    res.status(500).json({ success: false, message: "Coudn't create comment" });
                }
            }
            //console.log("this is campaign",campaign);
            return res.status(200).json({message:campaignId});
    } catch (error) {
        console.log("error comm",error);
        return res.status(500).json({success:false,message: "Coudn't create comment"});
    }
    
});

router.put("/edit/follow",async(req,res)=>{
    try {
        const {campaignId,campaignName,campaignLoc,campaignImage,campaignDesc,campaignDate} = req.body;
        console.log("campaignName",campaignName);
        console.log("campaignLoc",campaignLoc);
        console.log("campaignDesc",campaignDesc);
        console.log("campaignDate",campaignDate);

        
        const findCampaign = req.user.followingCampaigns.find(campaign => campaign._id.toString() === campaignId);
        if (findCampaign) {
            console.log('findCampaign:', findCampaign);
          
            req.user.followingCampaigns = req.user.followingCampaigns.filter(campaign => campaign._id.toString() !== campaignId);
          
            console.log('After:', req.user.followingCampaigns);
            await req.user.save({validateBeforeSave:false});
          
            return res.status(200).json({ success: true, message: "Unfollowed" });
          }
        else{
         const newCampaign = {
            _id:campaignId, 
            campaignName,
            campaignLoc,
            campaignImage,
            campaignDesc,
            campaignDate
          };
    
          req.user.followingCampaigns.push(newCampaign);
          console.log('After:', req.user.followingCampaigns);
          await req.user.save({validateBeforeSave:false});
    
        return res.status(200).json({success:true,message:"Following "});
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({success:false,message:"Error in follow process"});
    }
});

router.put("/fund",async(req,res)=>{
    const {fundAmount,campaignId,name} = req.body;
    try {
        const campaign = await campaignModal.findById({_id:campaignId});
        if(!campaign){
            return res.status(401).json({success:false,message:"No campaign found"});
        }
        else{
            campaign.fundingReceived += fundAmount;
            req.user.amountFunded += fundAmount;
            req.user.history.push({name:name,fundAmount:fundAmount});
            await req.user.save({validateBeforeSave:false});
            await campaign.save();
            return res.status(200).json({success:true,message:`Successfully donated - ${fundAmount}`});
            
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:true,message:"Error in donation"});
    }
    

});


router.get("/history",async(req,res)=>{
    try {
        // Assuming that req.user is already populated with the user information
        const userHistory = req.user.history;

        // You can send the user's funding history as the response
        res.status(200).json({
            success: true,
            history: userHistory
        });
    } catch (error) {
        // Handle any errors that might occur during the process
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

router.get("/search",async(req,res)=>{
    try {
    const searchTerm = req.query.searchTerm;
    console.log(`You searched for ${searchTerm}`);

    const campaigns = await campaignModal.find({campaignName: { $regex: new RegExp(searchTerm, 'i') }});
    console.log(`Search results for ${searchTerm}:`, campaigns);

    return res.json({ success: true, message: `Search results for ${searchTerm}`, data: campaigns });

    } catch (error) {
        console.error("Error searching campaigns:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export {router as campaignRouter};