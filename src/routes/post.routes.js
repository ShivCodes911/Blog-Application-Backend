import express from "express";

import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { createPost,getAllPost,getPostById } from "../controllers/post.controller.js";

const router = express.Router();


router.post("/create",UserAuthMidlleware,createPost);

router.get("/getAllPost",getAllPost);

router.get("/:id",getPostById);



export default router;