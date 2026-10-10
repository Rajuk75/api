import { RequestUserContext } from '../utils/context';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUserContext;
    }
  }
}
