import { Request, Response } from "express";

import NotificationModel from "../models/notification.model";

async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    console.log(
      "NotificationController.getNotifications() for userId: ",
      userId
    );
    // TODO: implement
    res.status(418).send();
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not get notifications");
  }
}

export default {
  getNotifications,
};
