import z from "zod";


export const createPostRequestBodySchema=z.object({
    title:z.string().min(3,"The Title should be greater than or equal to 3"),
    content:z.string().min(10,"The Content Should be Greater than or equal to 10")
});


export const getPostByIdSchema=z.object({
    id:z.string().regex(/^[0-9a-fA-F]{24}$/) 
});

export const updatePostIdSchema=z.object({
    id:z.string().regex(/^[0-9a-fA-F]{24}$/) 
});

export const updatePostDataSchema=z.object({
    title:z.string().min(3,"The Title should be greater than or equal to 3"),
    content:z.string().min(10,"The Content Should be Greater than or equal to 10")
});

export const deletePostIdSchema=z.object({
    id:z.string().regex(/^[0-9a-fA-F]{24}$/) 
});

export const togglePublishSchema=z.object({
    id:z.string().regex(/^[0-9a-fA-F]{24}$/) 
});

export const validatePostIdSchema=z.object({
    id:z.string().regex(/^[0-9a-fA-F]{24}$/)
});

