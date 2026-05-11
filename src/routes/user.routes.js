import express from "express";

import { signup, verifyEmail,login, refreshToken ,logout,logoutAll} from "../controllers/user.controller.js";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";



const router=express.Router();

router.post("/signup",signup);
router.post("/verify",verifyEmail);

router.post("/login",login);

router.get("/refresh-token",refreshToken);

router.post("/logout",UserAuthMidlleware,logout); 

router.post("/logout-all",UserAuthMidlleware,logoutAll); 

export default router;