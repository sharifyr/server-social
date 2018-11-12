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
const projectName = "server-social";
let log: bunyan;
type LogLevel = number | "error" | "trace" | "debug" | "info" | "warn" | "fatal" | undefined;

if (logstash) {
    const outStream = bunyanLumberjack({
        "tlsOptions": {
            "host": "logstash",
            "port": 5000,
            "ca": [fs.readFileSync("./snakeoilcert.pem", {"encoding": "utf-8"})]
        },
        "metadata": {"beat": "example", "type": "default"}
    });

    log = bunyan.createLogger({
        "name": projectName,
        "src": true,
        "streams": [{"level": "info", "type": "raw", "stream": outStream}]
    });
    outStream.on("connect", () => {
        log.info("Logger connected to stream");
    });
    outStream.on("dropped", (count: any) => {
        log.info("ERROR: Logger dropped " + count + " messages");
    });
    outStream.on("disconnect", (err: any) => {
        log.info("WARN : Logger disconnected", err);
    });

} else {
    log =  bunyan.createLogger({
        "name": projectName,
        "level": config.logLevel as LogLevel,
        "serializers": bunyan.stdSerializers,
        "src": true
    });
}

export const Logger = (filename: string) => {
    return log;
};
