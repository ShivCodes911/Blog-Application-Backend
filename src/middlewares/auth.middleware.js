import jwt from "jsonwebtoken";
import sessionModel from "../models/session.model.js";


export async function UserAuthMidlleware(req,res,next){
    try {
        const token=req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({
                status:false,
                message:"The user is not authorized "
            })
        }

        const decoded= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const session=await sessionModel.findById(decoded.sessionId);

        if(!session || session.revoked){
            return res.status(401).json({
                status:false,
                message:"Session Invalid"
            })
        }

        req.user={
           id: decoded.id,   //cannot write decoded._id bcz we stored id instead of _id in payload while creaating accessToken
           sessionId:decoded.sessionId
        }

        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            status:false,
            message:"Token is Invalid"
        })
    }
}