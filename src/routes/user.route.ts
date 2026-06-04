import { Router } from 'express';
import * as userController from '@/controllers/user.controller';
import { validate } from '@/middleware/validate.middleware';
import { createUserSchema } from '@/validators/user.validator';
import { authenticate, authorize } from '@forge/middleware';

const router = Router();

// Public Route
router.post('/login', userController.login);

// Protected Route: Any authenticated user
router.get('/', authenticate(), userController.getAllUsers);
router.get('/:id', authenticate(), userController.getUserById);

// Protected & Authorized Route: Must be an Admin
router.post(
  '/',
  authenticate(),
  authorize({ roles: ['admin'] }),
  validate(createUserSchema),
  userController.createUser,
);

export default router;
