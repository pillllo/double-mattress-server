import { Request, Response } from "express";
// import { getUsers as getUsersFromJsonDB } from "../models/db-json";
import userModel from "../models/user.model";

import { DeleteError } from "../types/errors";

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can"t remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove controller once login implemented
async function getUserIds(req: Request, res: Response) {
  try {
    console.log("user.controller.getUserIds()");
    const userIds = await userModel.getUserIds();
    res.status(200).send(userIds);
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not get provided user(s)");
  }
}

async function getUsers(req: Request, res: Response) {
  try {
    console.log("user.controller.getUsers()");
    const { userIds } = req.body;
    console.log(userIds);
    const users = await userModel.getUsers(userIds);
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not get provided user(s)");
  }
}

async function createUser (req: Request, res: Response) {
  try {
    console.log("user.controller.createUser()");
    const newUser = await userModel.createUser();
    res.status(200).send(newUser);
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not create new user");
  }
}

// TODO: implement user update
async function updateUser (req: Request, res: Response) {
  try {
    console.log("user.controller.updateUser()");
    res.status(401).send("Not implemented");
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not update user");
  }
}

async function deleteUser (req: Request, res: Response) {
  try {
    const { userId } = req.body;
    if (typeof userId !== "string") throw new Error("invalid userId");
    console.log("user.controller.deleteUser() for userId: ", userId);
    const result = await userModel.deleteUser(userId);
    // TODO: TS driving me insane, trying to catch the error to return sensible
    // info to client but....just, argh.
    // if (result && result.code && result.clientVersion) {
    //   // it's a DeleteError
    //   throw new Error("user not found");
    // }
    res.status(200).send(result);
  } catch (err) {
    console.error("ERROR: ", err);
    res.status(400).send("Could not delete user");
  }
}

export default {
  getUserIds,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
