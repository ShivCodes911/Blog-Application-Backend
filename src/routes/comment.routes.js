import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { comments } from "../controllers/comment.controller.js";

const router =express.Router();



router.post("/:id/comment",UserAuthMidlleware,comments);


export default router;
