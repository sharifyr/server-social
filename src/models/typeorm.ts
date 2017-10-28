import * as path from "path";
import "reflect-metadata";

import config from "../config/local";
import {createConnection} from "typeorm";
import {User} from "./user";
import Logger from "../util/logger";

const logger = Logger(path.basename(__filename));

const databaseConnection = createConnection({
  "type": "postgres",
  "url": config.connectionString,
  "synchronize": true,
  "entities": [User]
}).then((connection) => {
  logger.debug("db connection established");
  return connection;
});

export default databaseConnection;
