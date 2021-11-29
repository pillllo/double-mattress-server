import { Request, Response } from "express";
import mockUser from "../models/mockUser";

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

// Get couple profile (user profile and partner's profile)
async function getCoupleProfile(req: Request, res: Response) {
  try {
    // Find profile of the user
    const { userId } = req.body;
    const userProfile = mockUser.find((user) => user.userId === userId);

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

const userController = {
  getUserProfile,
  getCoupleProfile,
};

export default userController;
