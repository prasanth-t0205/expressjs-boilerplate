import { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync.util";
import * as userService from "@/services/user.service";

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
