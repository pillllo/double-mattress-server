import { Request, Response } from "express";
import EmailValidator from "email-validator";

import UserModel from "../models/user.model";
import ConnectionModel from "../models/connection.model";
import NotificationModel from "../models/notification.model";
import NotificationController from "./notification.controller";

async function initiateConnect(req: Request, res: Response): Promise<void> {
  try {
    console.log("ConnectionController.initiateConnect()");
    const { userId, email } = req.body;
    const initiator = await UserModel.getUser(userId);
    const isEmail = EmailValidator.validate(email);
    if (!initiator || !isEmail || email === initiator.email) {
      throw "Invalid request";
    }
    const target = await UserModel.getUserByEmail(email);
    if (!target) throw "Invalid request";
    if (initiator.linkedUserIds.length > 0 || target.linkedUserIds.length > 0) {
      throw "Already connected to a user";
    }
    // confirms that user exists, client will check name and confirm
    res.status(200).send({
      firstName: target.firstName,
      email: target.email,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
}

async function requestConnect(req: Request, res: Response): Promise<void> {
  try {
    console.log("ConnectionController.requestConnect()");
    const { userId, email } = req.body;
    const initiator = await UserModel.getUser(userId);
    const isEmail = EmailValidator.validate(email);
    if (!initiator || !isEmail || email === initiator.email) {
      throw "Invalid request";
    }
    const target = await UserModel.getUserByEmail(email);
    if (!target) throw "Invalid request";
    if (initiator.linkedUserIds.length > 0 || target.linkedUserIds.length > 0) {
      throw "Already connected to a user";
    }
    // can still request if target has requested to connect with them
    // TODO: review?? maybe disable??
    const pendingConnections = await ConnectionModel.checkPendingConnections(
      initiator,
      target
    );
    if (!pendingConnections.length) {
      const response = await ConnectionModel.requestConnection(
        initiator,
        target
      );
      if (!response) throw "error creating connection request";
    }
    // TODO: HERE TESTING
    NotificationModel.sendTestSocketMessage();
    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
}

async function completeConnect(req: Request, res: Response): Promise<void> {
  try {
    const { userId, connectToUserId } = req.body;
    if (!userId || !connectToUserId) {
      throw "Invalid request";
    }
    // the target of the connection request completes it!
    const target = await UserModel.getUser(userId);
    const initiator = await UserModel.getUser(connectToUserId);
    if (!target || !initiator) throw "user not found for connection";
    const success = await ConnectionModel.completeConnection(target, initiator);
    if (!success) throw "user linking unsuccessful";
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
}

const ConnectionController = {
  initiateConnect,
  requestConnect,
  completeConnect,
};

export default ConnectionController;
