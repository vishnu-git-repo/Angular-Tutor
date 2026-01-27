import { IUser } from "../utils/ifaces/IUser";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}