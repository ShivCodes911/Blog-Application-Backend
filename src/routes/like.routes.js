import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { toggleLike,getLikeCount } from "../controllers/like.controller.js";



const router =express.Router();


router.post("/:id/like",UserAuthMidlleware,toggleLike);
router.get("/:id/likes/count", getLikeCount);


export default router;