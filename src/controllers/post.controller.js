
import postModel from "../models/post.model.js";


import {createPostRequestBodySchema,getPostByIdSchema} from "../validators/post.validator.js";




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
};

export const getAllPost=async(req,res)=>{
    try {
        //can't use [allPost] like this bcz it will return only first index of the array rather than all elements(find()=> selct all post at once )

        const  allPost= await postModel.find().populate("author","name email");  
       
// //What populate does
// Instead of only returning: "author":"userId"(eg:dhfqijfuqfqfu42448) => it fetches related user data also.(name:shiv email:shiv@gmail.com)

        return res.status(200).json({
            status:true,
            message:"Here are your all the posts Enjoy !!!",
            allPost
        })
    } catch (error) {

        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal server error"
        })
        
    } 
};

export const getPostById=async(req,res)=>{
    try {
        const validationResult=await getPostByIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Invalid Id"
            });
        }

        const {id} = validationResult.data; // we will write like this {id} bcz zod after validation returns object

        const post = await postModel.findById(id).populate("author","name email");

        if(!post){
            return res.status(404).json({
                status:false,
                message:"No post has been uploaded !!!"
            })
        }

        return res.status(200).json({
            status:true,
            message:"Heres your post  !!!",
            post
        })

       
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        })
        
    }
}

