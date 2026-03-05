import {z} from "zod";


export const UpdateUserSchema = z.object({
  Name: z.string().trim().min(3, "Name is required"),
  Address: z.string().trim().min(10, "Address must be at least 10 characters"),
  Gender: z.enum(["Male", "Female", "Other"]),
  Phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid phone number"),
});

export const UpdatePasswordSchema = z.object({
  Password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[a-z]/, "Must include lowercase letter")
    .regex(/\d/, "Must include number")
    .regex(/[@$!%*?&]/, "Must include special characters - @$!%*?&"),
})