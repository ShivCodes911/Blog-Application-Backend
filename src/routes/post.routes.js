import express from "express";

import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { createPost,getAllPost,getPostById, updatePost } from "../controllers/post.controller.js";

const router = express.Router();


router.post("/create",UserAuthMidlleware,createPost);

router.get("/",getAllPost);

router.get("/:id",getPostById);
router.put("/:id",UserAuthMidlleware,updatePost);



export default router;