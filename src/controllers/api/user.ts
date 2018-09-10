import {Inject} from "typescript-ioc";

import {IUserProvider} from "../../providers/IUserProvider";
import {IAuthProvider} from "../../providers/IAuthProvider";
import {IUserCredentials} from "../../models/entities/user";
import {IUserSerialized} from "../../models/entities/IUserSerialized";

export class UserController {

  @Inject
  private userProvider!: IUserProvider;
  @Inject
  private authProvider!: IAuthProvider;

  public async update(userRequest: IUserSerialized) {
    const updatedUser = await this.userProvider.update(userRequest);
    return IUserProvider.serialize(updatedUser);
  }

  public async read(userId: number) {
    const user = await this.userProvider.getById(userId);
    return IUserProvider.serialize(user);
  }

  public async readList() {
    const users = await this.userProvider.getList();
    return users.map((u) => IUserProvider.serialize(u));
  }

  public async delete(userId: number) {
    await this.userProvider.deleteById(userId);
  }

  public async signup(userRequest: IUserSerialized) {
    try {
      const userData = await this.userProvider.create(userRequest);
      const userDataSerialized = IUserProvider.serialize(userData);
      const jwt = await this.authProvider.login(userData.username, userRequest.password);
      return {
          "authToken": jwt as string,
          "user": userDataSerialized
        };
    } catch (e) {
      throw e;
    }
  }

  public async login(credentials: IUserCredentials) {
    const jwt = await this.authProvider.login(credentials.username, credentials.password);
    if (!jwt) {
      throw new Error("Login Error");
    }
    const userId = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString()).id;
    const userData = await this.userProvider.getById(userId);
    const userDataSerialized = IUserProvider.serialize(userData);
    return {
      "authToken": jwt as string,
      "user": userDataSerialized
    };
  }
}
