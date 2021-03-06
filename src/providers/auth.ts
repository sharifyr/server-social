import * as path from "path";
import * as jwt from "jsonwebtoken";
import { Repository, Connection } from "typeorm";
import { Inject, Provides } from "typescript-ioc";

import {User} from "../models/entities/user";
import {IUser} from "../models/entities/IUser";
import { IConfig, config } from "../config";
import {ILogger, Logger} from "../util/logger";
import {IAuthProvider} from "./IAuthProvider";

const logger: ILogger = Logger(path.basename(__filename));

export interface IAccessToken {
  access_token: string;
}

export class AuthProvider implements IAuthProvider {

  private config: IConfig;
  @Inject
  private connection!: Connection;
  private repository: Repository<User>;

  public constructor() {
    this.config = config;
    this.repository = this.connection.getRepository(User);
  }

  public async login(username: string, password: string) {
    logger.info(username + " logging in");
    const user = await this.repository.findOne({"username": username});

    if (!user) {
      return "";
    }
    if (await (user as IUser).verifyPassword(password)) {
      return this.forgeToken( user );
    } else {
      return "";
    }
  }

  private forgeToken(user: IUser) {

    const payload = {
      "id": user.id,
      "iss": this.config.jwt.issuer,
      "sub": user.username = "@" + this.config.domain,
      "scopes": ["user"]
    };
    logger.debug({"obj": payload}, "signing jwt payload");

    const jwtSignOptions: jwt.SignOptions = {
      "expiresIn": 1440 // expires in 24 hours
    };
    return jwt.sign(payload, this.config.jwt.secret, jwtSignOptions);
  }

}
