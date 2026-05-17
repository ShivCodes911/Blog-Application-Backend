import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isVerified:{type:Boolean,default:false},
    profileImage:{type:String,default:""}
},{
    timestamps:true
});

const userModel =  mongoose.model("User",UserSchema);

export default userModel;

