import z from "zod";

export const signupPostRequestBodySchema = z.object({
    name: z.string().nonempty("Name si required"),
    email: z.string().email(),
    password: z.string().min(6, "password should be greater than 6 characters")
});