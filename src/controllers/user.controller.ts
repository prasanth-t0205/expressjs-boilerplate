import { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.util';
import * as userService from '@/services/user.service';
import { generateTokens, setRefreshCookie } from '@forge/auth';

export const login = catchAsync(async (req: Request, res: Response) => {
  // 1. In a real app, you would verify email/password here
  // const user = await authService.login(req.body.email, req.body.password);

  // Example dummy user payload
  const payload = { id: 'user_123', role: 'admin', email: 'test@example.com' };

  // 2. Generate Access and Refresh Tokens
  const { accessToken, refreshToken } = generateTokens(payload);

  // 3. Set the Refresh Token in a secure httpOnly cookie
  setRefreshCookie(res, refreshToken);

  // 4. Send the Access Token in the JSON response
  res.status(200).json({
    success: true,
    data: {
      user: payload,
      accessToken,
    },
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});
