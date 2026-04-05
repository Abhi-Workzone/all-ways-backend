import { Router } from 'express';
import { getAllServices, getActiveServices, createService, updateService, deleteService } from './service.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createServiceSchema } from './service.validation.js';
import { UserRole } from '../users/user.model.js';
const router = Router();

// Public
router.get('/', getAllServices);
router.get('/active', getActiveServices);

// Admin only
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createServiceSchema), createService);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateService);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteService);
export default router;