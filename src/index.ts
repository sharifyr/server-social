import * as path from "path";
import {Container} from "typescript-ioc";
import {Connection} from "typeorm";
import * as express from "express";
import * as http from "http";
import * as bodyParser from "body-parser";
import * as cors from "cors";

import IoC from "./dependencyResolution/IoC";
import { config } from "./config";
import { Logger } from "./util/logger";
import {RegisterRoutes} from "./routes";

const logger = Logger(path.basename(__filename));

logger.info("starting with config: ", config);

import "./controllers/tsoa/user";
import "./controllers/tsoa/contactRequest";
import "./controllers/tsoa/group";
import "./controllers/tsoa/swagger";

IoC.configure();
// establish the database connection
const connection = Container.get(Connection);

const start = async () => {

  try {
    const app = express();
    app.use(bodyParser.json({ "type": "application/json"}));
    app.use(bodyParser.urlencoded({ "extended": true }));
    app.use(cors());

    RegisterRoutes(app);

    const server = http.createServer(app  as (req: any, res: any) => void);
    server.listen(config.port, () => logger.info("Listening on port " + config.port));

  } catch (err) {
      logger.error(err);
      process.exit(1);
  }
};

start();
