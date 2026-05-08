import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.config.js";
dotenv.config(); 



const PORT =process.env.PORT || 3000;


connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is up and running on PORT ${PORT}`);
})
})
.catch((err)=>{
    console.error("Failed to connect DB",err);
    process.exit(1);
});






