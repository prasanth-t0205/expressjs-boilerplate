import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

export const comparePassword = async (
  plainText: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainText, hashedPassword);
};

export const validatePasswordStrength = (
  password: string,
): { valid: boolean; message?: string } => {
  if (password.length < 8)
    return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[A-Z]/.test(password))
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password))
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password))
    return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*]/.test(password))
    return {
      valid: false,
      message: 'Password must contain at least one special character (!@#$%^&*)',
    };

  return { valid: true };
};
