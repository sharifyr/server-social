import {IUserSerialized} from "./IUserSerialized";

export interface IContactRequestSerialized {
  id: number;
  fromUser: IUserSerialized;
  toUser: IUserSerialized;
}
