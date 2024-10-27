import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { userRouter } from "../routes/userRoute.js";
import cookieParser from "cookie-parser";
import { isLoggedIn } from "../middleware/userMiddleware.js";
import { detailsRouter } from "../routes/detailsRouter.js";
import { campaignRouter } from "../routes/campaignRouter.js";
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again after 15 minutes",
  });


dotenv.config({path: "config.env"});
const app = express();
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: `http://localhost:3000`,credentials:true}));

mongoose.connect(process.env.DATABASE_URL).then(()=>console.log("Connected to the database")).catch((error)=> console.log("error connecting to db - ",error));
    
app.listen(4000,()=>console.log("Server started"));


app.get("/",(req,res)=>{
    return res.json({message:"You are going right !!"})
})
app.use("/user",detailsRouter);
app.use("/registration",userRouter);
app.use("/campaign",isLoggedIn,campaignRouter);