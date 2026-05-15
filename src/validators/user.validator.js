import z from "zod";

export const signupPostRequestBodySchema = z.object({
    name: z.string().nonempty("Name si required"),
    email: z.string().email(),
    password: z.string().min(6, "password should be greater than 6 characters")
});


export const loginPostRequestBodySchema=z.object({
    email:z.string().email(),
    password:z.string().min(6,"password should be greater than 6")
});


export const verifyEmailPostRequestBodySchema=z.object({
    otp:z.string().length(6,"Otp must be of 6 digits"),
    email:z.string().email()
}) 

export const updateCurrentUserRequestBodySchema=z.object({
    updatedName:z.string().nonempty("Name is Required")
});