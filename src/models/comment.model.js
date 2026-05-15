import mongoose from "mongoose";



const commentSchema = new mongoose.Schema({
    content:{type:String,required:true},
    author:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    post:{type:mongoose.Types.ObjectId,ref:"Post",required:true},

},{
    timestamps:true,
});

const commentModel= mongoose.model("Comment",commentSchema);

export default commentModel;