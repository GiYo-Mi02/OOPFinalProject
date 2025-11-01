import http from "http";
import { app } from "./app";
import { env } from "./config/env";

const port = Number(env.PORT ?? 4000);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
