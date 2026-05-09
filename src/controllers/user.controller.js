import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import bcrypt from "bcrypt";
import otpModel from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"



import {generateOtp,getOtpHtml} from "../utils/utils.js";
import {sendEmail} from "../services/email.service.js";
import { loginPostRequestBodySchema, signupPostRequestBodySchema ,verifyEmailPostRequestBodySchema} from "../validators/user.validator.js";



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
};


export const verifyEmail = async (req, res) => {
  try {
    // Validate Request Body
    const validationResult =
      await verifyEmailPostRequestBodySchema.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        status: false,
        message: validationResult.error.message,
      });
    }

    const { otp, email } = validationResult.data;

    // Hash OTP
    const otpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // Find OTP Document
    const otpDoc = await otpModel.findOne({
      email,
      hashedOtp:otpHash,
    });

    // Invalid OTP
    if (!otpDoc) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP",
      });
    }

    // Check OTP Expiry
    if (otpDoc.expiresAt < new Date()) {
      await otpModel.deleteMany({ email });

      return res.status(400).json({
        status: false,
        message: "OTP Expired",
      });
    }

    // Find User
    const existingUser = await userModel.findById(otpDoc.user);

    if (!existingUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Already Verified
    if (existingUser.isVerified) {
      return res.status(400).json({
        status: false,
        message: "User already verified",
      });
    }

    // Verify User
    const updatedUser = await userModel.findByIdAndUpdate(
      otpDoc.user,
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );

    // Delete all OTPs for user
    await otpModel.deleteMany({
      user: otpDoc.user,
    });

    // Success Response
    return res.status(200).json({
      status: true,
      message: "Email verified successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
      },
    });

  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const login = async (req,res)=>{
    try {
      const validationResult=await loginPostRequestBodySchema.safeParseAsync(req.body);

      if(!validationResult.success){
         return res.status(400).json({
            status:false,
            meassge:validationResult.error.message
         })
      }

      const {email,password} = validationResult.data
      const existingUser = await userModel.findOne({email});

      if(!existingUser){
         return res.status(404).json({
            status:false,
            message:"User not Found signUp first "
         })
      }

      if(!existingUser.isVerified){
         return res.status(400).json({
            status:false,
            message:"Email not Verified signIn first "
         })
      };

      const isMatch=await bcrypt.compare(password,existingUser.password);

      if(!isMatch){
         return res.status(401).json({
            status:false,
            message:"Incorrect Password"
         })
      };


      const refreshToken=await jwt.sign({id:existingUser._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
      
      const refreshTokenHash=await crypto.createHash("sha256").update(refreshToken).digest("hex");

      const session=await sessionModel.create({
         userId:existingUser._id,
         hash:refreshTokenHash,
         ip:req.ip,
         userAgent:req.headers["user-agent"],
         
      });

      const accessToken=await jwt.sign({id:existingUser._id,sessionId:session._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});

      res.cookie("refreshToken",refreshToken,{
         httpOnly:true,
         secure:process.env.NODE_ENV==="production", //true in production
        sameSite:process.env.NODE_ENV=="production"?"none":"strict",// none in production
        maxAge:7*24*60*60*1000 //7days in milliseconds
        });
      

        return res.status(200).json({
            status:true,
            message:"Login Successfull",
            user:{
               name:existingUser.name,
               email:existingUser.email,
               id:existingUser._id,
               isVerified:existingUser.isVerified,
            },
            token:accessToken,
        });

      


    } catch (error) {
      console.error(error);
      return res.status(500).json({
         status:false,
         message:"Internal Server Error",
         error:error.message
      });
      
    }
}







