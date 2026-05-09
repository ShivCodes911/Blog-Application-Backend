import express from "express";

import { signup, verifyEmail } from "../controllers/user.controller.js";


const router=express.Router();

router.post("/signup",signup);
router.post("/verify",verifyEmail);

export default router;