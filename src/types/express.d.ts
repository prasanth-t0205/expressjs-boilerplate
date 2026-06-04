import { TokenPayload } from '@/forge/auth/tokens';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
