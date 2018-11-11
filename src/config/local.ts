import * as fs from "fs";

export default {
  "domain": "localhost",
  "clientOrigin": "localhost",
  "database": "postgres",
  "connectionString": "postgresql://sharifyr:sharifyrpassword@db/sharifyr",
  "port": 3000,
  "logLevel": "info",
  "jwt": {
    "secret": "secret",
    "issuer": "sharifyr",
    "duration": 86400
  },
  "sslOptions": {
    "key": fs.readFileSync("snakeoilkey.pem").toString(),
    "cert": fs.readFileSync("snakeoilcert.pem").toString(),
    "passphrase": "password"
  },
  "logstash": {
    "host": 'localhost', 
    "port": 5000
  }
};
