import * as path from "path";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as cors from "cors";
import {Container} from "typescript-ioc";
import {Connection} from "typeorm";
import * as Hapi from "hapi";
import * as HapiJwt from "hapi-auth-jwt2";
import * as HapiSwagger from "hapi-swagger";
import * as inert from "inert";
import * as vision from "vision";
import { graphqlHapi, graphiqlHapi } from "apollo-server-hapi";
import { importSchema } from "graphql-import";
import { makeExecutableSchema } from "graphql-tools";

import IoC from "./dependencyResolution/IoC";
import registerGroup from "./controllers/hapi/group";
import registerContactRequests from "./controllers/hapi/contactRequest";
import registerUsers from "./controllers/hapi/user";
import { config } from "./config";
import { Logger } from "./util/logger";
import { ConnectionProvider } from "./models/typeorm";
import { UserController } from "./controllers/user";

const typeDefs = importSchema("./dist/src/graphql/schema.graphql");
const resolvers = {
  "Query": {
    "getUserById": async (source: undefined, args: {id: number}) => {
      // console.log("getUserbyId called " + args.id + typeof(args.id));
      return await new UserController().read(args.id as number);
    }
  }
} as any;

const schema = makeExecutableSchema({ typeDefs, resolvers });

const logger = Logger(path.basename(__filename));

IoC.configure();
// establish the database connection
const connection = Container.get(Connection);

const start = async () => {
  try {
    const server = new Hapi.Server({
      "host": config.domain,
      "port": config.port,
      "routes": {
        "cors": {
          "headers": ["Accept", "Authorization", "Content-Type", "Access-Control-Allow-Origin"],
          "origin": [
            "http://localhost"
          ]
        }
      }
    });

    await server.register([
      HapiJwt,
      inert,
      vision,
      HapiSwagger,
      {
        "plugin": graphiqlHapi,
        "options": {
          "route": {
            "auth": false
          },
          "path": "/graphiql",
          "graphiqlOptions": {
            "endpointURL": "/graphql",

          },
        },
      },
      {
        "plugin": graphqlHapi,
        "options": {
          "path": "/graphql",
          "graphqlOptions": {
            "schema": schema,
          },
          "route": {
            "cors": true,
            "auth": false
          },
        },
      }
    ]);

    server.auth.strategy("jwt", "jwt",
    { "key": config.jwt.secret,
      "validate": () => {
        return {"isValid": true};
      },
      "verifyOptions": { "algorithms": [ "HS256" ] }
    });

    registerGroup(server);
    registerContactRequests(server);
    registerUsers(server);
    // registerSwagger(server);

    server.auth.default("jwt");
    await server.start();
    logger.info("Server running at:", server.info.uri);
  } catch (err) {
      logger.error(err);
      process.exit(1);
  }
};

start();
