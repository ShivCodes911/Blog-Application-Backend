import mongoose from "mongoose";

 const connectDB=async()=>{
    try {
       const connectInstance= await mongoose.connect(process.env.MONGO_URI)
       console.log(`MongoDB is Connected Succesfully ✅ : DB Host ${connectInstance.connection.host}`)
       //Which MongoDB host connected
       
    } catch (error) {
        console.error("Failed to connect DB:",error);
        process.exit(1);
    }
 }

 export default connectDB;

