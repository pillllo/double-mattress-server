import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import Projection from "../types/projection";
import moment from "moment";
// const moment = require("moment");
moment().format();

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
      let typeAverages = { income: 0, expense: 0 };
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
      let categoryAverages = {};
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
      let savings = {};
      const monthlyAverage3Months = typeAverages.income - typeAverages.expense;
      savings = { ...savings, monthlyAverage3Months };

      // TODO: get from historical table
      // SAVINGS: get total savings since joining
      // set start value depending on diff in months from current months
      let totalSinceJoining = 1000000;
      const diffQueriedMonthCurrentMonth = monthsDifference(date);
      totalSinceJoining =
        totalSinceJoining +
        monthlyAverage3Months * diffQueriedMonthCurrentMonth;

      // ADD TYPE & CATEGORY base projections (without projectedChanges) to each of 12 months
      let projections: Projection[] = [];
      let monthCounter = 0;
      let month = moment(date).startOf("month").toISOString();
      while (monthCounter <= 11) {
        savings = { ...savings, totalSinceJoining };
        const monthlyData = { savings, typeAverages, categoryAverages, month };
        projections.push(monthlyData);
        totalSinceJoining += monthlyAverage3Months;
        month = moment(month).add(1, "months").toISOString();
        monthCounter++;
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

  const endDate = moment(today).startOf("month").toISOString();

  const startDate = moment(endDate).subtract(3, "months").toISOString();

  return { startDate, endDate };
}

function monthsDifference(date: string) {
  const today = new Date();

  var currentMonth = moment(today);
  var queriedMonth = moment(date);

  const monthsDifference = queriedMonth.diff(currentMonth, "months");

  return monthsDifference;
}

const projectionController = {
  getProjections,
};

export default projectionController;
