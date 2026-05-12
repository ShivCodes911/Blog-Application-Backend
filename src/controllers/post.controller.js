import postModel from "../models/post.model.js";


import {createPostRequestBodySchema} from "../validators/post.validator.js";




export const createPost=async(req,res)=>{
    try {
        const validationResult=await createPostRequestBodySchema.safeParseAsync(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Invalid Data"
            });
        };

            // to obtain id from auth middleware
        const userId=req.user.id;

        if(!userId){
            return res.status(400).json({
                status:false,
                message:"You are not authorized to use this feature"
            });
        };

        const {title,content}=validationResult.data;


        const post = await postModel.create({
            title,
            content,
            author:userId,           //here userId is from req.user.id which we are sending from auth.middleware(req.user)
        });


        return res.status(200).json({
            status:true,
            message:"Post Created Successfully",
            post
        });
        
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status:false,
            message:"Internal server error"
        });
        
    }
}

