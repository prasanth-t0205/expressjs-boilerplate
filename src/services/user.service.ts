import { User } from '@/models/user.model';
import { CreateUserDto } from '@/dto/user.dto';
import { AppError } from '@/forge/errors';

export const getAllUsers = async () => {
  const users = await User.find({ isActive: true }).select('-__v');
  return users;
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id).select('-__v');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const createUser = async (userData: any) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create(userData);
  return user;
};
