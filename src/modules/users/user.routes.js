import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from './user.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Profile management for any authenticated user
router.get('/me', (req, res, next) => {
  req.params.id = req.user.userId;
  getUserById(req, res, next);
});

router.patch('/me', (req, res, next) => {
  req.params.id = req.user.userId;
  // Prevent non-admins from updating their own role or businessStatus
  if (req.user.role !== 'ADMIN') {
    delete req.body.role;
    delete req.body.businessStatus;
    delete req.body.adminComments;
  }
  updateUser(req, res, next);
});

// Admin ONLY management
router.use(authorize('ADMIN'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
