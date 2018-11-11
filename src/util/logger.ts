import * as fs from "fs";

import * as bunyanLumberjack from "bunyan-lumberjack";
import * as bunyan from "bunyan";
import { config } from "../config";

export interface ILogger {
  debug: (format: any, ...params: any[]) => void;
  info: (format: any, ...params: any[]) => void;
  warn: (format: any, ...params: any[]) => void;
  error: (format: any, ...params: any[]) => void;
  trace: (format: any, ...params: any[]) => void;
  fatal: (format: any, ...params: any[]) => void;
}

const logstash = true;
let log: bunyan;
if (logstash) {
    const outStream = bunyanLumberjack({
        "tlsOptions": {
            "host": "logstash",
            "port": 5000,
            "ca": [fs.readFileSync("./snakeoilcert.pem", {"encoding": "utf-8"})]
        },
        "metadata": {"beat": "example", "type": "default"}
    });

    outStream.on("connect", () => {
        log.info("Connected!");
    });
    outStream.on("dropped", (count: any) => {
        log.info("ERROR: Dropped " + count + " messages!");
    });
    outStream.on("disconnect", (err: any) => {
        log.info("WARN : Disconnected", err);
    });

    log = bunyan.createLogger({
        "name": "myLog",
        "streams": [{"level": "info", "type": "raw", "stream": outStream}]
    });
}

export const Logger = (filename: string) => {

    type LogLevel = number | "error" | "trace" | "debug" | "info" | "warn" | "fatal" | undefined;

    if (logstash) {
        return log;
    } else {
        log = bunyan.createLogger({
            "name": filename,
            "level": config.logLevel as LogLevel,
            "serializers": bunyan.stdSerializers,
            "src": true
        });
        return log;
    }
};
