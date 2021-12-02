import prisma from "./db";
import { v4 as uuid } from "uuid";

import User from "../types/user";
import { NewUserRequest } from "../types/requests";

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can't remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove model once login implemented
async function getAllUserIds(): Promise<string[] | undefined> {
  try {
    console.log("user.model.getUserIds()");
    const allUsers = await prisma.user.findMany({ distinct: ["userId"] });
    return allUsers.map((user) => user.userId);
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

// Get user profile, if user does not exist return false
async function getUser(userId: string) {
  try {
    console.log("user.model.getUser() for userId: ", userId);
    let result: User | false;
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (user) return (result = user);
    else return (result = false);
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

// Get user profiles of the user and all linked users, if user does not exist return false
async function getUsers(userId: string): Promise<User[]> {
  try {
    console.log("user.model.getUsers() for userId: ", userId);
    let results: User[] = [];
    const user = await getUser(userId);
    if (user) {
      results.push(user);
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
      return (results = results.concat(linkedUsers));
    } else {
      throw new Error("userId not found");
    }
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

// Get userIds of the user and all linked users, if user does not exist return false
async function getUserIds(userId: string) {
  try {
    console.log("user.model.getUserIds() for userId: ", userId);
    const allUsers = await getUsers(userId);
    const allUserIds = allUsers?.map((user) => user.userId);
    return allUserIds;
  } catch (err) {
    console.error("ERROR", err);
  }
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
  getAllUserIds,
  getUser,
  getUsers,
  getUserIds,
  createUser,
  updateUser,
  deleteUser,
};

// async function getUsers(userId: string) {
//   let results: User[] = [];
//   try {
//     console.log("user.model.getUsers() for userId: ", userId);
//     const user = await prisma.user.findUnique({
//       where: {
//         userId: userId,
//       },
//     });
//     if (!user) throw new Error(`no user profile found for userId: ${userId}`);
//     user && results.push(user);
//     let linkedUsers: User[] = [];
//     if (user?.linkedUserIds) {
//       linkedUsers = await prisma.user.findMany({
//         where: {
//           userId: {
//             in: user.linkedUserIds,
//           },
//         },
//       });
//     }
//     results = results.concat(linkedUsers);
//   } catch (err) {
//     console.error("ERROR: ", err);
//   }
//   return results;
// }
