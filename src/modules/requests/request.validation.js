import { z } from 'zod';
export const createRequestSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});
export const updateRequestStatusSchema = z.object({
  status: z.enum(['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
});