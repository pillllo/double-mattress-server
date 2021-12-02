import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";

// const categories = [
//   "salary",
//   "otherIncome",
//   "billsAndServices",
//   "home",
//   "shopping",
//   "entertainment",
//   "eatingOut",
//   "others",
// ];

const categories = [
  "Salary",
  "Other Income",
  "Bills and Services",
  "Home",
  "Shopping",
  "Entertainment",
  "Eating Out",
  "Others",
];
const types = ["income", "expense"];
let savings = {};
let typeAverages = { income: 0, expense: 0 };
let categoryAverages = {};

// Put together projection data (object) based on average historical data
async function getProjections(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;
    // Checks if user exists
    const user = await UserModel.getUser(userId);
    if (user) {
      // Get userId of user and all linked users
      const userIds = await UserModel.getUserIds(userId);

      // Get dateRange (with startDate and endDate) to query db for the average
      // endDate = first day of the current month | startDate first day of month 3 months ago
      // Current dateRange = 3 months
      const dateRange = setDateRange();

      // TYPES: get average for base projections (avg value for each type, without projectedChanges)
      await Promise.all(
        types.map(async (type) => {
          const average = await ProjectionModel.getAverageByType(
            userIds,
            type,
            dateRange
          );
          typeAverages = { ...typeAverages, [type]: average };
        })
      );

      // CATEGORIES: get average for base projections (avg value for each category, without projectedChanges)
      await Promise.all(
        categories.map(async (type) => {
          const average = await ProjectionModel.getAverageByCategory(
            userIds,
            type,
            dateRange
          );
          categoryAverages = { ...categoryAverages, [type]: average };
        })
      );

      // SAVINGS: get average monthly savings
      const monthlyAverage3Months = typeAverages.income - typeAverages.expense;
      savings = { ...savings, monthlyAverage3Months };

      // TODO: get from historical table
      // SAVINGS: get total savings since joining
      let totalSinceJoining = 1000000;

      // ADD TYPE & CATEGORY base projections (without projectedChanges) to each of 12 months
      let projections = {};
      let month = 0;
      while (month <= 11) {
        savings = { ...savings, totalSinceJoining };
        projections = {
          ...projections,
          [month]: { savings, typeAverages, categoryAverages },
        };
        month++;
        totalSinceJoining += monthlyAverage3Months;
      }

      res.status(200).send(projections);
    } else res.status(400).send(`No user profile found for userId: ${userId}`);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get projections");
  }
}

// HELPER FUNCTIONS

// Set the dateRange: returns startDate & endDate
// Reset date to first day of the current month
// Then subtracts 3 months
// endDate = first day of the current month
// startDate = first day of the month 3 months ago
function setDateRange() {
  const today = new Date();

  const endDate: Date | string = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).toISOString();

  let startDate: Date | string = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  let subtractThreeMonths = startDate.setMonth(startDate.getMonth() - 3);
  startDate = new Date(subtractThreeMonths).toISOString();
  return { startDate, endDate };
}

const projectionController = {
  getProjections,
};

export default projectionController;

// setDateRange based on input date
// function setDateRange(endDate: string) {
//   let todayDate = new Date(endDate);
//   let subtractThreeMonts = todayDate.setMonth(todayDate.getMonth() - 3);
//   let startDate = new Date(subtractThreeMonts).toISOString();
//   return { startDate, endDate };
// }
