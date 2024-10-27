import mongoose from "mongoose";


const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    uniqueId: { type: String, required: true },
  });


const campaign = new mongoose.Schema({
    campaignName:{type:String,required:true,unique:true},
    campaignSubject: { type: String, required: true },
    participants: [participantSchema],
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerName: { type: String, required: true },
    campaignAddress:{ type: String, required: true },
    selectedCountry: { type: String, required: true },
    selectedState: { type: String, required: true },
    helpEmail: { type: String, required: true },
    donationTarget: { type: Number, required: true },
    upvotes:{type:Number,default:0},
    downvotes:{type:Number,default:0},
    createdOn:{type:Date,default: Date.now},
    fundingReceived:{type:Number,default:0},
    likedPerson:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    dislikedPerson:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    comments:[{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      date: { type: Date, default: Date.now },
      text: { type: String, required: true },
      name: { type: String, required: true }
    }],
    isVerified:{type:Boolean,default:false}
});

export const campaignModal = mongoose.model("Campaign",campaign);