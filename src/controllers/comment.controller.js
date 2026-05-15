import commentModel from "../models/comment.model.js";
import userModel from "../models/user.model.js";
import postModel from "../models/post.model.js";
import { commentPostBodySchema, postIdSchema } from "../validators/comment.validator.js";




export const comments=async(req ,res)=>{
    try {
       const  validationResult=await postIdSchema.safeParseAsync(req.params);
       
       if(!validationResult.success){
        return res.status(400).json({
            status:false,
            message:"Post Id is not valid "
            
        })
       }
       const {id} =validationResult.data;

       const validationData=await commentPostBodySchema.safeParseAsync(req.body);

       if(!validationData.success){
        return res.status(400).json({
            status:false,
            message:"write the Comment again !!!"
        })
       }
       const {content}=validationData.data;

       const post = await postModel.findById(id);

       if(!post){
        return res.status(404).json({
            status:false,
            message:"Post does not Exist !!!"
        })
       }

       const user =req.user.id;

      const commentData=await commentModel.create({
        content,
        author:user,
        post:id,
      });

      return res.status(201).json({
        status:true,
        message:"comment added Successfully !!",
        commentData,
      })

        
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status:false,
        message:"Internal Server Error"
      })

        
    }
}