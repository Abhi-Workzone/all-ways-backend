import { Router } from 'express';
import { createRequest, getRequests, updateRequestStatus, assignVendor, getVendorsForService, confirmArrival, startWork, completeRequest, adminCreateRequest } from './request.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createRequestSchema, updateRequestStatusSchema } from './request.validation.js';
import { UserRole } from '../users/user.model.js';
import { upload, processImages } from '../../middlewares/upload.middleware.js';
const router = Router();
router.post('/admin/create', authenticate, authorize(UserRole.ADMIN), adminCreateRequest);
router.post('/', authenticate, validate(createRequestSchema), createRequest);
router.get('/', authenticate, getRequests);
router.patch('/:id/status', authenticate, updateRequestStatus);
router.post('/:id/assign', authenticate, authorize(UserRole.ADMIN), assignVendor);
router.get('/service/:serviceId/vendors', authenticate, authorize(UserRole.ADMIN), getVendorsForService);

router.patch('/:id/confirm-arrival', authenticate, confirmArrival);
router.patch('/:id/start-work', authenticate, upload.array('images', 3), processImages, startWork);
router.patch('/:id/complete', authenticate, upload.array('images', 3), processImages, completeRequest);
export default router;