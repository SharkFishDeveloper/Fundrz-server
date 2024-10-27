import jwt from "jsonwebtoken";
import { UserModal } from "../models/userModal.js";

export const isLoggedIn = async (req,res,next)=>{
    const fztoken = req.cookies.fztoken;
    
    if (!fztoken) {
        return res.status(401).json({ message: 'Log in to continue' });
    }
    console.log("Reading cookie bc",fztoken);
    try {
    const decodeToken = jwt.verify(fztoken,process.env.JWT_SECRET_KEY);
    const user = await UserModal.findById(decodeToken.userId);
    if(!user){
        return res.json({success:false,message:"Log in to continue"});
    }else{
        req.user = user;
        next();
        //console.log(user);
        //return res.json({success:true,foundUser:user,message:"rq.user"});
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Log in to continue" });
    }
}