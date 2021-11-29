import { Request, Response } from "express";
import mockUser from "../models/mockUser";
import { getUsers } from "../models/db-json";

/*

// Get user profile
async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    const userProfile = mockUser.find((user) => user.userId === userId);
    res.status(200).send(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not get the profile.");
  }
}

async function getUserProfiles (req: Request, res: Response) {
  try {
    const { userIds } = req.body;
    const users = getUsers(userIds);
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get profile for provided user(s)");
  }
}

// Get couple profile (user profile and partner's profile)
async function getCoupleProfile(req: Request, res: Response) {
  try {
    // Find profile of the user
    const { userId } = req.body;
    const userProfiles = getUserProfiles;

    // Get id of the account linked to the user
    const partnerId = userProfile?.linkedUserId;
    // Find profile of the linked user
    const partnerProfile = mockUser.find(
      (user) => user.linkedUserId === partnerId
    );

    // Combine the user profile and the partner profile
    const coupleProfile = { userProfile, partnerProfile };
    res.status(200).send(coupleProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not get the profile.");
  }
}

*/

//----------------------------------------------------------------
// CONTROLLER FOR JSON SERVER
//----------------------------------------------------------------

<<<<<<< HEAD
async function getUserProfiles(req: Request, res: Response) {
=======

async function getUserProfiles (req: Request, res: Response) {
>>>>>>> main
  try {
    const { userIds } = req.body;
    const users = getUsers(userIds);
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get profile for provided user(s)");
  }
}

const userController = {
  getUserProfiles,
};

export default userController;
