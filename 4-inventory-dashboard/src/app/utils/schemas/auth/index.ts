import { z } from "zod";

export const LoginSchema = z.object({
  Email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  Password: z
    .string()
    .min(8, "Password must be at least 8 characters")
});

export const RegisterSchema = z.object({
  Name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[A-Za-z ]+$/, "Name can contain only letters"),

  Email: z
    .string()
    .email("Invalid email format"),

  Password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[a-z]/, "Must include lowercase letter")
    .regex(/\d/, "Must include number")
    .regex(/[@$!%*?&]/, "Must include special character"),

  Gender: z.enum(["Male", "Female", "Other"]),

  Address: z
    .string()
    .min(10, "Address must be at least 10 characters"),

  Phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid phone number")
});