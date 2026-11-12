import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be text.",
    })
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_]{3,20}$/,
      "Username must be 3 to 20 characters: letters, numbers and underscores only.",
    )
    .refine(
      (name) => !name.startsWith("guest_"),
      "Usernames starting with guest_ are reserved.",
    ),
  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be text.",
    })
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const loginSchema = z.object({
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be text.",
    })
    .trim()
    .toLowerCase(),
  password: z.string({
    required_error: "Password is required.",
    invalid_type_error: "Password must be text.",
  }),
});
