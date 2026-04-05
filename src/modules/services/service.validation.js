import { z } from 'zod';
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  position: z.number().optional()
});