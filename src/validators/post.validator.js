import z from "zod";


export const createPostRequestBodySchema=z.object({
    title:z.string().min(3,"The Title should be greater than or equal to 3"),
    content:z.string().min(10,"The Content Should be Greater than or equal to 10")
});

