import * as path from "path";
import {Inject} from "typescript-ioc";
import {Get, Put, Route, Body, Tags, Request, Security, Delete, Post } from "tsoa";

import {Logger} from "../../util/logger";
import {IGroupSerialized} from "../../models/entities/group";
import {IUserProvider} from "../../providers/IUserProvider";
import {IGroupProvider} from "../../providers/IGroupProvider";
import { IJwtRequest } from "../requestExtensions";

const logger = Logger(path.basename(__filename));

@Route("group")
@Tags("group")
export class GroupController {

  @Inject
  private groupProvider!: IGroupProvider;
  @Inject
  private userProvider!: IUserProvider;

  @Put("")
  @Security("JWT", ["user"])
  public async update(@Body() group: IGroupSerialized): Promise<IGroupSerialized> {
    const updatedGroup = await this.groupProvider.update(group);
    return IGroupProvider.serialize(updatedGroup);
  }

  @Post("")
  @Security("JWT", ["user"])
  public async create(@Request() request: IJwtRequest, @Body() group: IGroupSerialized): Promise<IGroupSerialized> {
    const user = await this.userProvider.getById(request.user.id as number);
    if (user) {
      // create group record
      const groupData: IGroupSerialized = {
        "id": 0,
        "name": group.name,
        "owner": request.user.id as number,
        "users": group.users
      };
      const savedGroup = await this.groupProvider.create(groupData);
      return IGroupProvider.serialize(savedGroup);
    } else {
      throw new Error("Not authenticated");
    }
  }

  @Get("")
  @Security("JWT", ["user"])
  public async read(@Request() request: IJwtRequest): Promise<IGroupSerialized[]> {
    // get user record from jwt userId
    const user = await this.userProvider.getById(request.user.id as number);
    if (user) {
      return user.groups.map((g) => IGroupProvider.serialize(g));
    } else {
      throw new Error("Not authenticated");
    }
  }

  @Delete("/{id}")
  @Security("JWT", ["user"])
  public async delete(id: number): Promise<void> {
    await this.groupProvider.deleteById(id);
  }

}