import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js" 


const app = express();

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
    methods:['GET','POST','DELETE','PUT','PATCH','OPTIONS'],
    allowedHeaders:['Authorization','Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.send("System is Running");
});



app.use("/api/v1/auth",userRouter);
app.use("/api/v1/post",postRouter);



export default app;
