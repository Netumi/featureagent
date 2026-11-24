import { z } from 'zod';

export const generateDocSchema = z.object({
  featureIdea: z.string().min(3, 'Feature idea must be at least 3 characters long'),
  additionalContext: z.string().optional(),
  generateMockup: z.string().optional().transform(val => val === 'true' || val === '1' || val === true as any)
});

export const editDocSchema = z.object({
  documentation: z.any(),
  instruction: z.string().min(2, 'Instruction is required')
});

export const regenerateSectionSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  documentation: z.any()
});

export const editMockupSchema = z.object({
  existingTsx: z.string(),
  existingCss: z.string().optional(),
  instruction: z.string().min(2, 'Instruction is required'),
  featureContext: z.string().optional()
});
