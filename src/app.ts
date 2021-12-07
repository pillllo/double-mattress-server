import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import router from "./router";

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
  const { PORT } = process.env;

  const app = express();
  const corsConfig = {
    origin: [
      "http://localhost:3000",
      "https://checkout.stripe.com",
      "https://double-mattress.herokuapp.com",
    ],
    credentials: true,
  };

  app.use(cors(corsConfig));
  app.use(express.json());
  // "security"
  // app.use((req, res, next) => {
  //   const jwt = req.headers["client-jwt"];
  //   if (jwt !== process.env.CLIENT_JWT) {
  //     console.log("Auth failed");
  //     res.status(404).send();
  //   } else {
  //     next();
  //   }
  // });
  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} request received for url: ${req.url}`);
    next();
  });
  app.use(router);
  app.get("*", (req, res) => {
    res.status(404).send();
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server is listening at ${PORT}`);
  });
}

bootstrapServer();
