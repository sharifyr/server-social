import "reflect-metadata";
import * as path from "path";
import * as assert from "assert";
import { suite, test, slow, timeout } from "mocha-typescript";
import * as uuid from "uuid";

import {User} from "../src/models/entities/user";
import {IUser} from "../src/models/entities/IUser";
import {IUserSerialized} from "../src/models/entities/IUserSerialized";
import {UserFactory} from "../src/factories/user";
import {config} from "../src/config";
import {Logger} from "../src/util/logger";
import IoC from "../src/dependencyResolution/IoC";
import {Fixture} from "./fixture";
import {Container} from "typescript-ioc";
import {Connection} from "typeorm";
import { UserController } from "../src/controllers/user";

const logger = Logger(path.basename(__filename));
IoC.configure();
// establish the database connection
const connection = Container.get(Connection);

@suite class AuthProviderTests {

  private static getUserIdFromJwt(jwt: string) {
    const myUserData = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString());
    return myUserData.id;
  }

  @test public async canCreateUserAndLogin() {
    const fixture = new Fixture();

    const serializedUser = fixture.generateRandomUserData();
    const myAccessToken = await fixture.userController.signup(serializedUser);
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);
    const credentials = {
      "username": serializedUser.username,
      "password": serializedUser.password
    };

    const loginResult = await fixture.userController.login(credentials);

    const myUser = await fixture.userController.read(myUserId);

    await fixture.userController.delete(myUserId);
    assert.notEqual(loginResult, null, "new user can log in");
  }

  @test public async loginNamesMustBeUnique() {
    const fixture = new Fixture();

    const serializedUser = fixture.generateRandomUserData();
    const myAccessToken = await fixture.userController.signup(serializedUser);
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);

    try {
      await fixture.userController.signup(serializedUser);
      assert.fail("duplicate user should not be creatable");
    } catch (e) {
      assert.equal(e, "Error: User already exists");
    }

    await fixture.userController.delete(myUserId);
  }

  @test public async loginBadPassword() {
    const fixture = new Fixture();

    const myAccessToken = await fixture.userController.signup(fixture.generateRandomUserData());
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);

    const credentials = {
      "username": fixture.testUser1.username,
      "password": "notMyPassword"
    };

    try {
      const loginResult2 = await fixture.userController.login(credentials);
      assert.fail("bad password should not log in");
    } catch (e) {
      assert.equal(e, "Error: Login Error");
    }
    await fixture.userController.delete(myUserId);
  }

  @test public async loginBadUsername() {
    const fixture = new Fixture();

    const myAccessToken = await fixture.userController.signup(fixture.generateRandomUserData
());
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);

    const credentials = {
      "username": "notMyUsername",
      "password": fixture.testUserPassword
    };

    try {
      const loginResult3 = await fixture.userController.login(credentials);
      assert.fail("bad username should not log in");
    } catch (e) {
      assert.equal(e, "Error: Login Error");
    }
    await fixture.userController.delete(myUserId);
  }

  @test public async canUpdateUser() {
    const fixture = new Fixture();

    const myAccessToken = await fixture.userController.signup(fixture.generateRandomUserData
());
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);

    const myUser = await fixture.userController.read(myUserId);

    const myUpdatedUserData: IUserSerialized = {
      "id": myUserId,
      "username": "testuser",
      "email": "email2@mail.com",
      "firstName": "jane2",
      "lastName": "doe2",
      "password": "",
      "contacts": []
    };

    await fixture.userController.update(myUpdatedUserData);
    const myUpdatedUser = await fixture.userController.read(myUserId);

    await fixture.userController.delete(myUserId);

    assert.notEqual(myUser.email, myUpdatedUser.email, "updated email");
    assert.notEqual(myUser.firstName, myUpdatedUser.firstName, "updated firstName");
    assert.notEqual(myUser.lastName, myUpdatedUser.lastName, "updated lastName");

  }

  @test public async canDeleteUser() {
    const fixture = new Fixture();

    const myAccessToken = await fixture.userController.signup(fixture.generateRandomUserData
());
    const myUserId = AuthProviderTests.getUserIdFromJwt(myAccessToken.access_token);

    const myDeletedUser = await fixture.userController.delete(myUserId);
    try {
      const myUpdatedUser = await fixture.userController.read(myUserId);
      assert.fail("deleted user should not be able to log in");
    } catch (e) {
      assert.equal(e, "Error: User does not exist");
    }
  }

  @test public async canAddContacts() {
    const fixture = new Fixture();

    const users = fixture.generateRandomUsers(2);

    const myAccessToken1 = await fixture.userController.signup(users[0]);
    const myAccessToken2 = await fixture.userController.signup(users[1]);

    const myUserId1 = AuthProviderTests.getUserIdFromJwt(myAccessToken1.access_token);
    const myUserId2 = AuthProviderTests.getUserIdFromJwt(myAccessToken2.access_token);

    // mock the data express reads from our JWT token.
    // This is the minimum data our controller needs to recieve to act.
    const mockExpressRequest1 = {"user": {"userId": myUserId1}} as Express.Request;
    const contactRequestCreated = await fixture.contactRequestController
      .sendContactRequest(mockExpressRequest1, myUserId2);

    // get user2's pending contact requests
    const mockExpressRequest2 = {"user": {"userId": myUserId2}} as Express.Request;
    const user2ContactRequests = await fixture.contactRequestController.getContactRequests(mockExpressRequest2);

    // accept the pending request
    const acceptedRequest = await fixture.contactRequestController.acceptContactRequest(user2ContactRequests[0].id);

    // both friends should now be linked
    const myUpdatedUser1 = await fixture.userController.read(myUserId1);
    const myUpdatedUser2 = await fixture.userController.read(myUserId2);

    // cleanup should cascade to contact request table
    await fixture.userController.delete(myUserId1);
    await fixture.userController.delete(myUserId2);

    assert.notEqual(null, contactRequestCreated);
    assert.notEqual(null, contactRequestCreated.fromUser);
    assert.notEqual(null, contactRequestCreated.toUser);
    assert.equal(1, user2ContactRequests.length);
    assert.equal(contactRequestCreated.id, user2ContactRequests[0].id);
    assert.notEqual(null, acceptedRequest);
    assert.notEqual(null, acceptedRequest.fromUser);
    assert.notEqual(null, acceptedRequest.toUser);
    assert.equal(myUserId1, myUpdatedUser2.contacts[0].id);
    assert.equal(myUserId2, myUpdatedUser1.contacts[0].id);

  }
}