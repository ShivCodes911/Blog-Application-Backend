import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { comments , getPostComments} from "../controllers/comment.controller.js";

const router =express.Router();



router.post("/:id/comment",UserAuthMidlleware,comments);

router.get("/:id/comment",UserAuthMidlleware,getPostComments)


export default router;
