import { Get, Route, Security, Tags } from "tsoa";
import * as fs from "fs";

@Route("")
@Tags("meta")
export class TsoaSwaggerController {

    @Security("JWT", ["user"])
    @Get("/swagger.json")
    public async getUser(): Promise<{}> {
        return new Promise((resolve, reject) => {
          fs.readFile("./dist/src/swagger.json", {"encoding": "utf-8"}, (err: any, data: any) => {
            if (err) {
              reject("error reading swagger file");
            }
            resolve(JSON.parse(data));
          });
        });
    }
}
