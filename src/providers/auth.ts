import * as path from "path";
import * as jwt from "jsonwebtoken";
import { Repository, Connection } from "typeorm";
import { Inject, Provides } from "typescript-ioc";

import {User, IUser} from "../models/entities/user";
import { IConfig } from "../config";
import {ILogger, Logger} from "../util/logger";
import { config } from "../config";

const logger: ILogger = Logger(path.basename(__filename));

export abstract class IAuthProvider {
  login: (username: string, password: string) => Promise<string | null>;
}

export interface IAccessToken {
  access_token: string;
}

@Provides(IAuthProvider)
export class AuthProvider implements IAuthProvider {

  private config: IConfig;
  @Inject
  private connection: Connection;
  private repository: Repository<User>;

  public constructor() {
    this.config = config;
    this.repository = this.connection.getRepository(User);
  }

  public async login(username: string, password: string) {
    const user = await this.repository.findOne({"username": username});

    if (!user) {
      return null;
    }

    if (await (user as IUser).verifyPassword(password)) {
      return this.forgeToken( user );
    } else {
      return null;
    }
  }

  private forgeToken(user: IUser) {

    const payload = {
      "id": user.id,
      "iss": this.config.jwt.issuer,
      "sub": user.username = "@" + this.config.domain
    };
    logger.debug({"obj": payload}, "signing jwt payload");

    const jwtSignOptions: jwt.SignOptions = {
      "expiresIn": 1440 // expires in 24 hours
    };
    return jwt.sign(payload, this.config.jwt.secret, jwtSignOptions);
  }

}
