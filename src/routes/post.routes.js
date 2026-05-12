import express from "express";

import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = express.Router();


router.post("/create",UserAuthMidlleware,createPost);



export default router;