import express from "express";

import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { createPost,getAllPost } from "../controllers/post.controller.js";

const router = express.Router();


router.post("/create",UserAuthMidlleware,createPost);

router.get("/getAllPost",getAllPost);



export default router;