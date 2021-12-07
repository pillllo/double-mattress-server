import path from "path";
import fs from "fs";
import http from "http";
import express from "express";
import cors from "cors";
import { Server as io } from "socket.io";

import router from "./routes/router";
import registerSocketHandlers from "./sockets";

function bootstrapServer() {
  // support switching between .env.production and .env.development
  const environment = process.env.ENVIRONMENT || "development";
  const file = environment === "production" ? ".env" : `.env.${environment}`;
  console.log(`Starting in mode: ${environment}, attempting to load ${file}`);
  const filePath = path.resolve(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  if (!exists && environment !== "production") {
    console.log(`Unable to find ${file} file`);
    console.log("Please perform the following actions:");
    console.log(`1) create ${file} in root dir with env variables`);
    console.log("2) update package.json script if necessary, prepending\n\n");
    console.log("ENVIRONMENT=environment_name\n\n");
    console.log('to the existing existing command in "scripts".');
    process.exit();
  }
  // correct .env file has been found, now load it
  require("custom-env").env(environment);
  const { PORT } = process.env || 3001;

  // 1. create Express app instance, configure static assets & routes
  const expressApp = express();
  // const staticPath = path.join(__dirname, "./public");
  const corsConfig = {
    origin: [
      "http://localhost:3000",
      "https://checkout.stripe.com",
      "https://double-mattress.herokuapp.com",
    ],
    credentials: true,
    methods: "*",
  };

  expressApp.use(cors(corsConfig));
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.static("public"));
  // "security"
  // expressApp.use((req, res, next) => {
  //   const jwt = req.headers["client-jwt"];
  //   if (jwt !== process.env.CLIENT_JWT) {
  //     console.log("Auth failed");
  //     res.status(404).send();
  //   } else {
  //     next();
  //   }
  // });
  // Logging middleware
  expressApp.use((req, res, next) => {
    console.log(`${req.method} request received for url: ${req.url}`);
    next();
  });
  // expressApp.use(express.static(staticPath));
  expressApp.use(router);
  expressApp.get("*", (req, res) => {
    res.status(404).send();
  });

  // 2. create Node HTTP server and pass it the Express instance
  const httpServer = http.createServer(expressApp);
  // 3.create socket.io server, and pass it the HTTP server
  const socketServer = new io(httpServer);
  // 4. declare socket listeners
  registerSocketHandlers(socketServer);
  socketServer.on("connection", (socket) => {
    console.log("Socket connection initiated: ", socket.id);
  });
  // 5. listen to the HTTP server, NOT the Express app
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is listening at ${PORT}`);
  });
}

bootstrapServer();
