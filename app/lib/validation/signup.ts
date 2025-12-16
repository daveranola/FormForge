import * as z from "zod";

export const SignupFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.email({ message: 'Please enter a valid email.' }),
    password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    }),
});

export type SignupValues = z.infer<typeof SignupFormSchema>;