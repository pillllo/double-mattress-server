import { Request, Response } from "express";
import EmailValidator from "email-validator";

import UserModel from "../models/user.model";
import ConnectionModel from "../models/connection.model";

async function initiateConnect(req: Request, res: Response): Promise<void> {
  try {
    console.log("ConnectionController.initiateConnect()");
    const { userId, email } = req.body;
    const user = await UserModel.getUser(userId);
    const isEmail = EmailValidator.validate(email);
    if (!user || !isEmail || email === user.email) throw "Invalid request";
    const userToConnect = await UserModel.getUserByEmail(email);
    if (!userToConnect) throw "Invalid request";
    // don't want to return userId - security issues
    res.status(200).send({
      firstName: userToConnect.firstName,
      email: userToConnect.email,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
}

const ConnectionController = {
  initiateConnect,
};

export default ConnectionController;
