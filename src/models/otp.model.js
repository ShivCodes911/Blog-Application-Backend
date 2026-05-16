import mongoose from "mongoose";

const otpSchema= new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:[true,"User is Required"]},
    email:{type:String,unique:true,required:[true,"Email is Required "]},
    hashedOtp:{type:String,required:[true,"Otp is required"]},
    purpose:{type:String,enum:["email-verification","password-reset"],required:true}
},{
    timestamps:true
}
    
)


const otpModel=mongoose.model("otp",otpSchema);

export default otpModel;

