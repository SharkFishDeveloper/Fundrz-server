import mongoose from "mongoose";
import validator from 'validator';

const user = new mongoose.Schema({
    name:{type:String,required:true,unique:true,minlength: [6,"Name is too small"]},
    email:{type:String,required:true,unique:true,validate:[validator.isEmail,"Enter a valid email"]},
    password:{type:String,required:true,minlength: [6,"Password is too small"]},
    imageUrl:{type:String,default:null},
    joinedOn:{type:Date,default:Date.now()},
    amountFunded:{type:Number,defualt:0},
    createdCampaigns:[{
        _id: { type: mongoose.Schema.Types.ObjectId}, // Use the default ObjectId for _id
        campaignName: { type: String, required: true },
        campaignImage: { type: String, required: true },
        campaignDesc: { type: String, required: true },
        campaignDate: { type: Date, required: true }, // Ensure the type is Date
        campaignLoc: { type: String, required: true },
    }],
    followingCampaigns:[{
        _id: { type: mongoose.Schema.Types.ObjectId}, // Use the default ObjectId for _id
        campaignName: { type: String, required: true },
        campaignImage: { type: String, required: true },
        campaignDesc: { type: String, required: true },
        campaignDate: { type: Date, required: true }, // Ensure the type is Date
        campaignLoc: { type: String, required: true },
        // joinedOn:{}
      }],
      history:[{
        name: { type: String, required: true },
        fundAmount: { type: Number, required: true },
        Date: { type: Date, default:Date.now},
    
    }]
});


export const UserModal = mongoose.model("User",user);