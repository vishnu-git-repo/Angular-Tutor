import {z} from "zod";
export const CreateEquipmentSchema = z.object({
  Name: z.string().trim().min(1, "Name is required"),
  Description: z.string().trim().min(1, "Description is required"),
  Price: z.coerce.number().positive("Price must be greater than 0"),
  Category: z.number(),
  Count: z.coerce.number().int().positive("Count must be at least 1")
});
