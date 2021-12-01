import prisma from "./db";
import { v4 as uuid } from "uuid";

import User from "../types/user";
import { NewUserRequest } from "../types/requests";

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can't remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove model once login implemented
async function getUserIds(): Promise<string[] | undefined> {
  try {
    console.log("user.model.getUserIds()");
    const allUsers = await prisma.user.findMany({ distinct: ["userId"] });
    return allUsers.map((user) => user.userId);
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function getUsers(userId: string) {
  let results: User[] = [];
  try {
    console.log("user.model.getUsers() for userId: ", userId);
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!user) throw new Error(`no user profile found for userId: ${userId}`);
    user && results.push(user);
    let linkedUsers: User[] = [];
    if (user?.linkedUserIds) {
      linkedUsers = await prisma.user.findMany({
        where: {
          userId: {
            in: user.linkedUserIds,
          },
        },
      });
    }
    results = results.concat(linkedUsers);
  } catch (err) {
    console.error("ERROR: ", err);
  }
  return results;
}

async function createUser(userData: NewUserRequest) {
  try {
    console.log("user.model.createUser()");
    console.log(userData);
    const result = await prisma.user.create({
      data: {
        ...userData,
        userId: uuid(),
      },
    });
    return result;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

// TODO: implement proper updateUser functionality
async function updateUser() {
  try {
    console.log("user.model.updateUser()");
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

// TODO: tried implementing proper return types but TS driving me up the wall
async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (user) {
      await prisma.user.delete({
        where: {
          userId: userId,
        },
      });
      return user;
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  getUserIds,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
