import express from "express";

import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { createPost,getAllPost,getPostById, updatePost ,deletePost ,myPost,togglePublish,uploadPostCoverImage} from "../controllers/post.controller.js";
import {upload} from "../middlewares/upload.middleware.js";

const router = express.Router();


router.post("/create",UserAuthMidlleware,createPost);

router.get("/",getAllPost);

router.get("/:id",getPostById);
router.put("/:id",UserAuthMidlleware,updatePost);
router.delete("/:id",UserAuthMidlleware,deletePost);

router.get("/me/post",UserAuthMidlleware,myPost);

router.patch("/publish/:id",UserAuthMidlleware,togglePublish);

router.patch("/:id/cover-image",UserAuthMidlleware,upload.single("coverImage"),uploadPostCoverImage);



export default router;