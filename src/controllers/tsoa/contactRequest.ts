import { Get, Put, Post, Route, Security, Request, Tags } from "tsoa";
import {Inject} from "typescript-ioc";

import {IContactRequestSerialized} from "../../models/entities/IContactRequestSerialized";
import {IContactRequestProvider} from "../../providers/IContactRequestProvider";
import { IJwtRequest } from "../requestExtensions";

@Route("contacts")
@Tags("contacts")
export class TsoaContactRequestController {

    @Inject
    private contactRequestProvider!: IContactRequestProvider;

    @Get("")
    @Security("JWT", ["user"])
    public async getContactRequests(@Request() request: IJwtRequest): Promise<IContactRequestSerialized[]> {
      return await this.contactRequestProvider.getContactRequests(request.user.id as number);
    }

    @Post("request/{userId}")
    @Security("JWT", ["user"])
    public async sendContactRequest(@Request() request: IJwtRequest, userId: number): Promise<IContactRequestSerialized> {
      return await this.contactRequestProvider.sendContactRequest(request.user.id as number, userId);
    }

    @Put("accept/{requestId}")
    @Security("JWT", ["user"])
    public async acceptContactRequest(requestId: number): Promise<IContactRequestSerialized> {
      return await this.contactRequestProvider.acceptContactRequest(requestId);
    }

    @Put("reject/{requestId}")
    @Security("JWT", ["user"])
    public async rejectContactRequest(requestId: number): Promise<void> {
      await this.contactRequestProvider.rejectContactRequest(requestId);
    }
}
