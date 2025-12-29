import * as z from "zod";

export const createSubmissionSchema = z.object({
  answersJson: z.record(z.string(), z.unknown()),
  metadataJson: z.record(z.string(), z.unknown()).optional(),
  honeypot: z.string().optional(),
  startedAt: z.number().int().optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
