import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { comments , getPostComments,updateComment} from "../controllers/comment.controller.js";

const router =express.Router();



router.post("/:id/comment",UserAuthMidlleware,comments);

router.get("/:id/comment",UserAuthMidlleware,getPostComments);

router.put("/comment/:id",UserAuthMidlleware,updateComment);


export default router;
