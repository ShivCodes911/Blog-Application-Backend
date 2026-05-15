import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { toggleLike,getLikeCount,checkUserLikedPost } from "../controllers/like.controller.js";



const router =express.Router();


router.post("/:id/like",UserAuthMidlleware,toggleLike);
router.get("/:id/likes/count", getLikeCount);

router.get("/:id/liked", UserAuthMidlleware, checkUserLikedPost);


export default router;