import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import router from "./router";
// import jsonDb from "./models/db-json";

const { PORT } = process.env;
const app = express();

const corsConfig = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsConfig));
app.use(express.json());
// "security"
app.use((req, res, next) => {
  const jwt = req.headers["client-jwt"];
  if (jwt !== process.env.CLIENT_JWT) {
    console.log("auth failed");
    res.status(404).send();
  } else {
    next();
  }
});
// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request received for url: ${req.url}`);
  next();
});
app.use(router);
app.get("*", (req, res) => {
  res.status(404).send("Sorry, this page could not be found.");
});

(async function () {
  try {
    console.log(`💿 Db is connected`);
  } catch {
    console.log(`❌ Could not connect to db`);
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server is listening at ${PORT}`);
  });
})();
