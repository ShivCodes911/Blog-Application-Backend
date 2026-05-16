import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import bcrypt from "bcrypt";
import otpModel from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"



import {generateOtp,getOtpHtml} from "../utils/utils.js";
import {sendEmail} from "../services/email.service.js";
import { loginPostRequestBodySchema, signupPostRequestBodySchema ,verifyEmailPostRequestBodySchema,updateCurrentUserRequestBodySchema, changePasswordPostBodySchema, forgotPasswordEmailBodySchema, resetPasswordBodySchema} from "../validators/user.validator.js";
import { superRefine } from "zod";



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


      const refreshToken= jwt.sign({id:existingUser._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
      
      const refreshTokenHash=  crypto.createHash("sha256").update(refreshToken).digest("hex");

      const session=await sessionModel.create({
         userId:existingUser._id,
         hash:refreshTokenHash,
         ip:req.ip,
         userAgent:req.headers["user-agent"],
         
      });

      const accessToken= jwt.sign({id:existingUser._id,sessionId:session._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});

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


export const refreshToken= async (req,res)=>{
  try {
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(401).json({
        status:false,
        message:"You are not logged in"
      })
    }

    const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

    const hashedrefreshToken= crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
      hash:hashedrefreshToken,
      revoked:false
    });

    if(!session){
      return res.status(401).json({
        status:false,
        message:"Invalid Session or token is revoked"
      })
    }

    const accessToken=jwt.sign({id:decoded.id,sessionId:session._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"}); 
    const newRefreshToken= jwt.sign({id:decoded.id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});

    const newRefreshTokenHash=crypto.createHash("sha256").update(newRefreshToken).digest("hex");


    await sessionModel.findOneAndUpdate(
      {_id:session._id},
    {
      hash:newRefreshTokenHash
    });

    res.cookie("refreshToken",newRefreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:process.env.NODE_ENV==="production"?"none":"strict",
      maxAge:7*24*60*60*1000
    })

    return res.status(200).json({
      status:true,
      message:"Token Refreshed Successfully",
      token:accessToken,
    });


} catch (error) {
  console.error(error);
  return res.status(500).json({
    status:false,
    message:"Internal Server Error",
    error:error.message,
  });
    
  }
}


export const logout=async (req,res)=>{

  try {
    const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      status:false,
      message:"You are not logged in"
    });
  }

  const hashedrefreshToken=crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session=await sessionModel.findOne({
    hash:hashedrefreshToken,
    revoked:false
  })

  if(!session){
    return res.status(401).json({
      status:false,
      message:"Invalid refresh Token"
    })
  }

  session.revoked=true;
  await session.save();


res.clearCookie("refreshToken",{
   httpOnly:true,
   secure:process.env.NODE_ENV==="production",
   sameSite:process.env.NODE_ENV==="production"?"none":"strict",
});

  return res.status(200).json({
    status:true,
    message:"Logged Out Successfully"
  })
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status:false,
      message:"Internal Server Error",
      error:error.message,
    })
  }
}


export const logoutAll=async (req,res)=>{
  try {
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(401).json({
        status:false,
        message:"You are not logged in"
      })
    }

    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    
     await sessionModel.updateMany({
      userId:decoded.id,
      revoked:false
    },{
      revoked:true
    });

    res.clearCookie("refreshToken",{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:process.env.NODE_ENV==="production"?"none":"strict",
      maxAge:7*24*60*60*1000
    })

    return res.status(200).json({
      status:true,
      message:"Logged Out of all the devices successfully",
    })
    
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status:false,
      message:"Internal Server Error",
      error:error.message,
    })
    
  }
};


export const getCurrentUser=async(req,res)=>{
  try {
    const user=await userModel.findById(req.user.id).select("-password"); // "-paasword"=> exclude password and select

    return res.status(200).json({
      status:true,
      message:"Here are you details",
      user
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status:false,
      message:"Internal Server Error"
    })
    
  }
};

export const updateCurrentUser=async(req,res)=>{
  try {
    const validationResult=await updateCurrentUserRequestBodySchema.safeParseAsync(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        status:false,
        message:"Body is Invalid"
      })
    }
    const {updatedName}=validationResult.data;

    const user = await userModel.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        status:false,
        message:"User is not authorized"
      })
    }

    user.name=updatedName;
    await user.save();

    return res.status(200).json({
      status:true,
      message:"User Name has Been Updated Succesfully !",
      updatedName
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status:false,
      message:"Internal Server Error"
    })
    
  }
};

export const changePassword=async(req,res)=>{
try {
  const validationResult=await changePasswordPostBodySchema.safeParseAsync(req.body);

  if(!validationResult.success){
    return res.status(400).json({
      status:false,
      message:"password type is Invalid"
    })
  }

  const {oldPassword,newPassword} = validationResult.data;

  const user=await userModel.findById(req.user.id);

  if(!user){
    return res.status(404).json({
      status:false,
      message:"User is not authorized ! "
    })
  }

 const comparePassword= await bcrypt.compare(oldPassword,user.password);

 if(!comparePassword){
  return res.status(400).json({
    status:false,
    message:"Invalid password, Enter again"
  })
 }

 const hashedNewPassword=await bcrypt.hash(newPassword,10);

 user.password=hashedNewPassword;
 await user.save();

 return res.status(200).json({
  status:true,
  message:"Password changed Successfully !!! "
 })
} catch (error) {
  console.error(error);
  return res.status(500).json({
    status:false,
    message:"Internal Server Error !! "
  })
  
}

};

export const forgetPassword=async(req,res)=>{
  try {
    const validationResult=await forgotPasswordEmailBodySchema.safeParseAsync(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        status:false,
        message:"Enter valid Email"
      })
    }

    const {email}=validationResult.data;

    const user = await userModel.findOne({email});

    if(!user){
      return res.status(404).json({
        status:false,
        message:"User not found, please signup"
      })
    }

    const otp=generateOtp();
    const html=getOtpHtml(otp);

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.deleteMany({  //=> remove old reset OTPs
   email, 
   purpose:"password-reset"
});

    await otpModel.create({  //=> create only one fresh OTP
      email,
      hashedOtp,
      user:user._id,
      purpose:"password-reset"
    });

    await sendEmail(email,"Password Reset OTP",`Your Otp is ${otp} for next 10 min`,html);

    return res.status(200).json({
        status:"success",
        msg:"Password reset OTP sent successfully",
        user:{
            name:user.name,
            email:user.email,
            Verified:user.isVerified,
        },
      });



  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status:false,
      message:"Internal Server Error"
    })
    
  }
};

export const resetPassword=async(req,res)=>{
  try {
    const validationResult=await resetPasswordBodySchema.safeParseAsync(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        status:false,
        message:"Enter the credential Properly"
      })
    }

    const {email,otp,newPassword}=validationResult.data;

    const hashedOtp= crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({
      email,
      hashedOtp,
      purpose:"password-reset"
    })

    if(!otpDoc){
      return res.status(400).json({
        status:false,
        message:"Email or Otp is Incorrect"
      })
    }

    if(otpDoc.expiresAt < new Date()){

        await otpModel.deleteOne({_id:otpDoc._id});  // this delete expire otp

      return res.status(400).json({
        status:false,
        message:"Otp expired & Enter again"
      })
    }
  const user = await userModel.findOne({email});
    if(!user){
      return res.status(404).json({
        status:false,
        message:"User does Not Exist"

      })
    }

    const hashedPassword=await bcrypt.hash(newPassword,10);

    user.password=hashedPassword;
    await user.save();

     await otpModel.deleteOne({_id:otpDoc._id}); 
     
     return res.status(200).json({
      status:true,
      message:"Password Reset Succesfully "
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status:false,
      message:"Internal Server Error ! "
    })
    
  }
}







