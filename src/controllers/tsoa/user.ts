import { Get, Put, Post, Delete, Route, Security, Body, Tags, Request } from "tsoa";
import {Inject} from "typescript-ioc";

import { IAuthResponse } from "../../models/entities/IAuthResponse";
import { IUserSerialized } from "../../models/entities/IUserSerialized";
import { IUserCredentials } from "../../models/entities/user";
import { UserController } from "../api/user";
import { IJwtRequest } from "../requestExtensions";

@Route("user")
@Tags("user")
export class TsoaUserController {

    @Inject
    private userController!: UserController;

    /** Get a user by id */
    @Security("JWT", ["user"])
    @Get("/{id}")
    public async getUser(id: number): Promise<IUserSerialized> {
        return this.userController.read(id);
    }

    /** Get a list of users */
    @Security("JWT", ["user"])
    @Get("")
    public async getUserList(): Promise<IUserSerialized[]> {
        return this.userController.readList();
    }

    /** Update the logged in user */
    @Security("JWT", ["user"])
    @Put("")
    public async update(@Request() request: IJwtRequest, @Body() user: IUserSerialized): Promise<IUserSerialized> {
        user.id = request.user.id as number; // can only update your own user
        return this.userController.update(user);
    }

    /** Delete the logged in user */
    @Security("JWT", ["user"])
    @Delete("")
    public async delete(@Request() request: IJwtRequest): Promise<void> {
        return this.userController.delete(request.user.id as number);
    }

    /** Create a new user */
    @Post("/signup")
    public async signup(@Body() user: IUserSerialized): Promise<IAuthResponse> {
        return this.userController.signup(user);
    }

    /** Exchange login credentials for an auth token */
    @Post("/login")
    public async login(@Body() credentials: IUserCredentials): Promise<IAuthResponse> {
        return this.userController.login(credentials);
    }
}
