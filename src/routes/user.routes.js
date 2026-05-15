import express from "express";

import { signup, verifyEmail,login, refreshToken ,logout,logoutAll, getCurrentUser,updateCurrentUser,changePassword} from "../controllers/user.controller.js";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import userModel from "../models/user.model.js";



const router=express.Router();

router.post("/signup",signup);
router.post("/verify",verifyEmail);

router.post("/login",login);

router.get("/refresh-token",refreshToken);

router.post("/logout",UserAuthMidlleware,logout); 

router.post("/logout-all",UserAuthMidlleware,logoutAll); 

router.get("/me",UserAuthMidlleware,getCurrentUser);

router.patch("/me",UserAuthMidlleware,updateCurrentUser);

router.patch("/change-password", UserAuthMidlleware, changePassword);

export default router;