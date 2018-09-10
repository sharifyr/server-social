import {IUserSerialized} from "./IUserSerialized";

export abstract class IAuthResponse {
  public authToken!: string;
  public user!: IUserSerialized;
}
