import mongoose from "mongoose";
import { required } from "zod/mini";

const likeScehma=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    post:{type:mongoose.Schema.Types.ObjectId,ref:"Post",required:true}
},{
    timestamps:true
});

const likeModel=mongoose.model("Like",likeScehma);

export default likeModel;