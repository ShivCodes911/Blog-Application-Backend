import dotenv from "dotenv";
import nodemailer from "nodemailer";


dotenv.config();
 
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:"oauth2",
        user:process.env.GOOGLE_USER_ID,
        clientId:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        refreshToken:process.env.GOOGLE_REFRESH_TOKEN
    }
});

transporter.verify((error,success)=>{
    if(error){
        console.error("Error in connecting the Email server")
    }else{
        console.log("Email server is Ready to sent the verification message");
    }
});

//creating function sendMail

export const sendEmail=async(to,subject,text,html)=>{
    try {
        const info =await transporter.sendMail({
            from:`"Your Name" <${process.env.GOOGLE_USER_ID}>`,
            to:to,
            subject:subject,
            text:text,
            html:html
        });
        console.log("Message sent :%s",info.messageId);
        console.log("Preview URL:%s",nodemailer.getTestMessageUrl(info));

        return info; 


    } catch (error) {
        console.error("Error in sending mail:",error);
        throw error;
    }
}

