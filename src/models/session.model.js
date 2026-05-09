import mongoose from "mongoose";

const sessionSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    hash:{
        type:String,
        required:[true,"Hash is required"],
    },
    ip:{type:String,required:[true,"Provide User ip"]},
    userAgent:{type:String,required:[true,"User Agent is required "]},
    revoked:{type:Boolean,default:false},

},{
    timestamps:true
});


const sessionModel=mongoose.model("session",sessionSchema)

export default sessionModel;