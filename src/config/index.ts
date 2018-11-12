import defaultConfig from "./local";
import testConfig from "./test";
import {ConnectionOptions} from "typeorm";
import { ConnectionSingleton } from "../models/typeorm";

export interface IJWT {
  "secret": string;
  "issuer": string;
  "duration": number;
}

export interface ISSLOptions {
  "key": string;
  "cert": string;
  "passphrase": string;
}

export interface ILogstashOptions {
  "host": string;
  "port": number;
}

export interface IConfig {
  "domain": string;
  "clientOrigin": string;
  "database": "mysql" | "mariadb" | "postgres" | "sqlite" | "mssql"
    | "oracle" | "websql" | "cordova" | "sqljs" | "mongodb";
  "connectionString": string;
  "port": number;
  "logLevel": string;
  "jwt": IJWT;
  "sslOptions": ISSLOptions;
  "logstash": ILogstashOptions;
}

if (process && process.env && process.env.NODE_ENV) {
  const env = (process.env.NODE_ENV as string).trim();
  if (env === "DEV") {
    // currently using this on a heroku deployment
    defaultConfig.connectionString =  process.env.DATABASE_URL as string;
    defaultConfig.port = Number(process.env.PORT as string);
    defaultConfig.domain = "0.0.0.0" as string;
    defaultConfig.clientOrigin = (process.env.ORIGIN as string);
  }

  if (env === "TEST") {
    defaultConfig.database = testConfig.database;
    defaultConfig.logLevel = testConfig.logLevel;
  }
}

export const config = (defaultConfig as IConfig);
