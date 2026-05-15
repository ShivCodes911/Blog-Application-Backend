import z from "zod";

export const commentPostBodySchema=z.object({
   content:z.string().min(3,"comment should be at least of 3 characters").max(350,"Comment limit exceeds"),
});

export const postIdSchema=z.object({
   id:z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID")
}); 