import postModel from "../models/post.model.js";


import {createPostRequestBodySchema,deletePostIdSchema,getPostByIdSchema, updatePostDataSchema,updatePostIdSchema} from "../validators/post.validator.js";




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


export const updatePost=async(req,res)=>{
   try {
     const validationResult=await updatePostIdSchema.safeParseAsync(req.params);

    if(!validationResult.success){
        return res.status(400).json({
            status:false,
            message:"Invalid Id"
        })
    }

    const {id}= validationResult.data;

    const validationData=await updatePostDataSchema.safeParseAsync(req.body);

    if(!validationData.success){
        return res.status(400).json({
            status:false,
            message:"Invalid Data"
        });
    }

    const {title,content} = validationData.data;

    
    const post = await postModel.findById(id);

    if(!post){
        return res.status(404).json({
            status:false,
            message:"Post not found !!!"
        })
    }

    const authorId=post.author.toString(); 
    //post declared upper side=>This line converts the post owner's MongoDB ObjectId into a normal string. ✅

    if(authorId!==req.user.id){
        return res.status(403).json({
            status:false,
            message:"You are not authorized to update the post"
        })
    }

    const updatedPost=await postModel.findByIdAndUpdate(
        id
    ,{
        title,
        content
    },{
        new:true  // return the updated document instead of old one 
    });



    return res.status(200).json({
        status:true,
        message:"Post Updated Successfully",
        updatedPost
    });
    
   } catch (error) {
    console.error(error);
    return res.status(500).json({
        status:false,
        message:"Internal Server Error"
    });
    
   }

};

export const deletePost=async(req,res)=>{
    try {
        const validationResult= await deletePostIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json(
            {status:false,
                message:"Invalid Id"
            });
        }
        const {id}=validationResult.data;

        const post = await postModel.findById(id);

        if(!post){
            return res.status(404).json({
                status:false,
                message:"Post Not Found"
            })
        }

        if(post.author.toString()!==req.user.id){
            return res.status(403).json({
                status:false,
                message:"You are not authorized to delete this post"
            })
        }

        await postModel.findByIdAndDelete(id);

        return res.status(200).json({
            status:true,
            message:"Post Deleted Successfully",
            
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        });
    }
};

export const myPost=async(req,res)=>{
 try{
     const userId=req.user.id;

     if(!userId){
        return res.status(400).json({
            status:false,
            message:"User not found"
        })
     }

     const post = await postModel.find({author:userId});

     if(post.length===0){
        return res.status(404).json({
            status:false,
            message:"No posts have been uploaded !!!"
        })
     }

     return res.status(200).json({
        status:true,
        message:"Post found",
        post
     })

 }catch(error){
    console.log(error);
    return res.status(500).json({
        status:false,
        message:"Internal server error"
    })
 }   
}