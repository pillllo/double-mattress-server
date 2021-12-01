import { Request, Response } from "express";
// import { getUsers as getUsersFromJsonDB } from "../models/db-json";
import UserModel from "../models/user.model";
import UserId from "../types/id";

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can"t remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove controller once login implemented
async function getUserIds(req: Request, res: Response): Promise<void> {
  try {
    console.log("user.controller.getUserIds()");
    const userIds = await UserModel.getUserIds();
    res.status(200).send(userIds);
  } catch (err) {
    console.error(err);
    res.status(400).send([]);
  }
}

async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    console.log("user.controller.getUsers() for userId: ", userId);
    const users = await UserModel.getUsers(userId);
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not get provided user(s)");
  }
}

async function createUser(req: Request, res: Response): Promise<void> {
  try {
    console.log("user.controller.createUser()");
    const userData = req.body;
    console.log(userData);
    if (!userData.firstName || !userData.linkedUserIds) {
      throw new Error("invalid request");
    }
    const newUser = await UserModel.createUser(userData);
    res.status(200).send(newUser);
  } catch (err) {
    console.error(err);
    res.status(400).send(JSON.stringify("Could not create new user"));
  }
}

// TODO: implement user update
async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    console.log("user.controller.updateUser()");
    res.status(401).send("Not implemented");
  } catch (err) {
    console.error(err);
    res.status(400).send("Could not update user");
  }
}

async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    if (typeof userId !== "string") throw new Error("invalid userId");
    console.log("user.controller.deleteUser() for userId: ", userId);
    const result = await UserModel.deleteUser(userId);
    if (!result) {
      throw new Error("user not found");
    }
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
