import * as z from 'zod';

export const createFormSchema = z.object({
    projectId: z.number().int('Project ID must be an integer'),
    name: z.string().min(3, 'Form name must be at least 3 characters long')
    .max(100, 'Form name must be at most 100 characters long')
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
