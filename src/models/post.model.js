import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    published:{type:Boolean,default:false},
    coverImage:{
        url:{
            type:String,default:"",
        },
        public_id:{
            type:String,default:""
        }
    },
},{
    timestamps:true 
});

 const  postModel=mongoose.model("Post",postSchema);

 export default postModel;
