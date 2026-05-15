import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { toggleLike } from "../controllers/like.controller.js";



const router =express.Router();


router.post("/:id/like",UserAuthMidlleware,toggleLike)


export default router;