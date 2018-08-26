import * as Hapi from "hapi";

export default (server: Hapi.Server) => {

  const basePath = "/";

  server.route({
    "method": "GET",
    "path": basePath,
    "options": {
      "auth": false,
      "tags": ["api"],
      "description": "Get Server Status",
      "notes": "Root API endpoint returns json object indicating server status"
    },
    "handler": (request) => {
      return {
        "status": "online"
      };
    }
  } as Hapi.ServerRoute);
};
