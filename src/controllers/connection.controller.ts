import { Request, Response } from "express";

import UserModel from "../models/user.model";
import ConnectionModel from "../models/connection.model";

async function initiateConnect(req: Request, res: Response): Promise<void> {
  try {
    const { userId, email } = req.body;
    console.log("ConnectionController.initiateConnect() for userId: ", userId);
    // TODO: implement
    res.status(418).send();
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not connect");
  }
}

const ConnectionController = {
  initiateConnect,
};

export default ConnectionController;
