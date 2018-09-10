import { IUserSerialized } from "../models/entities/IUserSerialized";

export interface IJwtRequest extends Express.Request {
  user: IUserSerialized;
}
