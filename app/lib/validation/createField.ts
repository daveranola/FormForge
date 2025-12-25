import * as z from "zod";

export const createFieldSchema = z.object({
  formId: z.number().int("Form ID must be an integer"),
  key: z.string().min(1, "Field key is required").max(64, "Field key is too long"),
  label: z.string().min(1, "Field label is required").max(100, "Field label is too long"),
  type: z.string().min(1, "Field type is required").max(50, "Field type is too long"),
  required: z.boolean().optional(),
  orderIndex: z.number().int("Order index must be an integer").nonnegative().optional(),
  options: z.unknown().optional(),
  config: z.unknown().optional(),
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;

export const updateFieldSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  required: z.boolean().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  options: z.unknown().optional(),
  config: z.unknown().optional(),
});

export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
