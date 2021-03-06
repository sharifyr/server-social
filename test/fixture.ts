import {Inject} from "typescript-ioc";
import * as uuid from "uuid";

import {IUserSerialized} from "../src/models/entities/IUserSerialized";
import {UserController} from "../src/controllers/api/user";
import {ContactRequestController} from "../src/controllers/api/contactRequest";

export class Fixture {

    @Inject
    public readonly userController!: UserController;
    @Inject
    public readonly contactRequestController!: ContactRequestController;

    public static getUserIdFromJwt(jwt: string) {
      const myUserData = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString());
      return myUserData.id;
    }

    public generateRandomUserData() {
      return {
        "id": -1,
        "username": uuid.v4(),
        "email": uuid.v4() + "@" + uuid.v4() + "." + uuid.v4(),
        "firstName": uuid.v4(),
        "lastName": uuid.v4(),
        "password": uuid.v4(),
        "contacts": []
      } as IUserSerialized;
    }

    public generateRandomUsers(count: number) {
      return Array
        .apply(null, Array(count))
        .map((v: any, i: number, array: any[]) => this.generateRandomUserData());
    }

    public testUser1: IUserSerialized = {
      "id": -1,
      "username": "testuser1",
      "email": "email1@mail.com",
      "firstName": "jane",
      "lastName": "doe",
      "password": "",
      "contacts": []
    };

    public testUser2: IUserSerialized = {
      "id": -1,
      "username": "testuser2",
      "email": "email2@mail.com",
      "firstName": "john",
      "lastName": "doe",
      "password": "",
      "contacts": []
    };

    public modifiedTestUser: IUserSerialized = {
      "id": -1,
      "username": "testuser",
      "email": "email2@mail.com",
      "firstName": "jane2",
      "lastName": "doe2",
      "password": "",
      "contacts": []
    };

    public testUserPassword: string = "password";

}
