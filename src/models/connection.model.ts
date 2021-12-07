import prisma from "./db";
import { ConnectionRequest } from "@prisma/client";

import UserModel from "./user.model";

import User from "../types/user";
import { UserId } from "../types/id";
import { CONNECTION_REQUEST_STATUS as STATUS } from "../config/constants";

async function checkPendingConnections(
  initiator: User,
  target: User
): Promise<ConnectionRequest[]> {
  try {
    console.log("ConnectionModel.getPendingConnections()");
    const pending = await prisma.connectionRequest.findMany({
      where: {
        initiatingUserId: initiator.userId,
        targetUserId: target.userId,
        status: STATUS.OPEN,
      },
    });
    return pending;
  } catch (err) {
    console.log("ERROR: ", err);
    return [];
  }
}

async function requestConnection(initiator: User, target: User) {
  try {
    console.log("ConnectionModel.requestConnection()");
    const response = await prisma.connectionRequest.create({
      data: {
        initiatingUserId: initiator.userId,
        targetUserId: target.userId,
      },
    });
    return response;
  } catch (err) {
    console.error("ERROR: ", err);
    return null;
  }
}

async function completeConnection(
  target: User,
  initiator: User
): Promise<boolean> {
  try {
    console.log("ConnectionModel.requestConnection()");
    // TODO: HERE HERE finish the connection
    // there must be an active CR in the other direction
    const pendingConnections = await prisma.connectionRequest.findMany({
      where: {
        initiatingUserId: initiator.userId,
        targetUserId: target.userId,
        status: STATUS.OPEN,
      },
      orderBy: { createdOn: "asc" },
    });
    const mostRecent = pendingConnections[0];
    if (!mostRecent) throw "no connection request found for supplied userIds";
    // link the users
    const initiatorLinkSuccess = await prisma.user.update({
      where: { userId: initiator.userId },
      data: {
        linkedUserIds: {
          push: target.userId,
        },
      },
    });
    const targetLinkSuccess = await prisma.user.update({
      where: { userId: target.userId },
      data: {
        linkedUserIds: {
          push: initiator.userId,
        },
      },
    });
    // TODO: make this more robust, cleanup on fail, etc
    if (!initiatorLinkSuccess && !targetLinkSuccess) throw "link unsuccessful";
    await prisma.connectionRequest.update({
      where: { id: mostRecent.id },
      data: {
        status: STATUS.COMPLETE,
        respondedOn: new Date(),
      },
    });
    return true;
  } catch (err) {
    console.error("ERROR: ", err);
    return false;
  }
}

const ConnectionModel = {
  checkPendingConnections,
  requestConnection,
  completeConnection,
};

export default ConnectionModel;
