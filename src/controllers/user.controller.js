import userModel from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import otpModel from "../models/otp.model.js";


import {generateOtp,getOtpHtml} from "../utils/utils.js";
import {sendEmail} from "../services/email.service.js";
import { signupPostRequestBodySchema } from "../validators/user.validator.js";








export async function signup(req,res){
   try {
     const validationResult=await signupPostRequestBodySchema.safeParseAsync(req.body);

    if(!validationResult.success){
        return res.status(411).json({
            status:"failed",
            error: validationResult.error.message
        });
     }

     const {name,email,password} =  validationResult.data;

     const existingUser=await userModel.findOne({
        email
     });


     if(existingUser){
        return res.status(400).json({
            status:"failed",
            message:`user with this email ${email} already exists `
        })
     }

     const hashedPassword = await bcrypt.hash(password,10);


     const user =await userModel.create({
        name,
        email,
        password:hashedPassword
     });

     const otp= generateOtp();

     const html =getOtpHtml(otp);


     const hashedOtp=crypto.createHash("sha256").update(otp).digest("hex");

     await otpModel.create({
        email,
        hashedOtp,
        user:user._id
     })

     await sendEmail(email,"OTP verification",`Your Otp code is ${otp} for 10 min`,html);

     return res.status(200).json({
        status:"success",
        msg:"User created Successfully",
        user:{
            name:user.name,
            email:user.email,
            Verified:user.isVerified,
        },

        
     })

} catch (error) {
   console.error(error);
   return res.status(500).json({
      status:"failed",
      message:"Internal Server Error"
   })
    
   }
}