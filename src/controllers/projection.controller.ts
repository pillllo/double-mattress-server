import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import Projection from "../types/projection";
import moment from "moment";
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

// Calculate projection data (object) based on average historical data
async function getProjections(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;

    // Checks if user exists
    const user = await UserModel.getUser(userId);

    if (user) {
      // Get userId of user and all linked users
      const userIds = await UserModel.getUserIds(userId);

      // Get dateRangeForAvgCalc (with startDate and endDate) to query db for the average
      // endDate = first day of the current month | startDate first day of month 3 months ago
      // Current dateRangeForAvgCalc = 3 months
      const dateRangeForAvgCalc = dateRangeFromCurrentMonthIntoPast(3);

      // TYPES: get average for base projections (avg value for each type, without projectedChanges)
      let typeAverages = { income: 0, expense: 0 };
      await Promise.all(
        types.map(async (type) => {
          const average = await ProjectionModel.getAverageByType(
            userIds,
            type,
            dateRangeForAvgCalc
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
            dateRangeForAvgCalc
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
      const diffQueriedMonthCurrentMonth = monthsDiffFromCurrentMonth(date);
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

// Create a new projectedChange in the db
async function createProjectedChange(req: Request, res: Response) {
  try {
    const projectedChangeData = req.body;
    const newProjectedChange = await ProjectionModel.createProjectedChange(
      projectedChangeData
    );
    console.log("🎯 newProjectedChange", newProjectedChange);
    res.status(201).send("Projected change created in the db");
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create projected change");
  }
}

async function getProjectedChanges(req: Request, res: Response) {
  try {
    console.log("🎯 called controller getProjectedChanges");
    const { userId, date } = req.body;
    // Get userId of user and all linked users
    const userIds = await UserModel.getUserIds(userId);
    const dateRangeProjectedChanges = dateRangeFromStartDate(date, 12);
    console.log("🎯 dateRangeProjectedChanges", dateRangeProjectedChanges);
    const projectedChanges =
      await ProjectionModel.findProjectedChangesByDateRange(
        userIds,
        dateRangeProjectedChanges
      );
    console.log("🎯 projectedChanges", projectedChanges);
    res.status(200).send(projectedChanges);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not find projected changes");
  }
}

//----------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------

// Returns startDate & endDate of a dateRange that ends in current month
// endDate = first day of the current month
// startDate = first day of the month, rangeInMonths months ago
function dateRangeFromCurrentMonthIntoPast(rangeInMonths: number) {
  const today = new Date();
  const endDate = moment(today).startOf("month").toISOString();
  const startDate = moment(endDate)
    .subtract(rangeInMonths, "months")
    .toISOString();
  return { startDate, endDate };
}

// Returns startDate & endDate of a dateRange that starts with startDate in arguments
// startDate = first day of the month given in arguments
// endDate = first day of the month, rangeInMonths months into the future
function dateRangeFromStartDate(startDate: string, rangeInMonths: number) {
  startDate = moment(startDate).startOf("month").toISOString();
  const endDate = moment(startDate).add(rangeInMonths, "months").toISOString();
  return { startDate, endDate };
}

// Returns difference, in months, between the queried date
// and the current month
function monthsDiffFromCurrentMonth(date: string) {
  const today = new Date();
  var currentMonth = moment(today);
  var queriedMonth = moment(date);
  const monthsDiffFromCurrentMonth = queriedMonth.diff(currentMonth, "months");
  return monthsDiffFromCurrentMonth;
}

const projectionController = {
  getProjections,
  createProjectedChange,
  getProjectedChanges,
};

export default projectionController;
