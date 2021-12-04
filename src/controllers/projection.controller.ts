import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import Projection from "../types/projection";
import moment from "moment";
import { ProjectedChange } from ".prisma/client";
moment().format();

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
          let average = await ProjectionModel.getAverageByType(
            userIds,
            type,
            dateRangeForAvgCalc
          );
          if (!average) average = 0;
          typeAverages = { ...typeAverages, [type]: average };
        })
      );

      // CATEGORIES: get average for base projections (avg value for each category, without projectedChanges)
      let categoryAverages = {};
      await Promise.all(
        categories.map(async (type) => {
          let average = await ProjectionModel.getAverageByCategory(
            userIds,
            type,
            dateRangeForAvgCalc
          );
          if (!average) average = 0;
          categoryAverages = { ...categoryAverages, [type]: average };
        })
      );

      // SAVINGS: get average monthly savings
      let savings = { monthlyAverage3Months: 0, totalSinceJoining: 0 };
      const monthlyAverage3Months = typeAverages.income - typeAverages.expense;
      savings = { ...savings, monthlyAverage3Months };

      // TODO: get from historical table
      // SAVINGS: get total savings since joining
      let totalSinceJoining = 1000000;
      // set start value depending on diff in months from current months
      // calculate number of months between queried month and current month
      const diffQueriedMonthCurrentMonth = monthsDiffFromCurrentMonth(date);
      // get totalSinceJoining by multiplying months since since current month * average savings / months
      totalSinceJoining =
        totalSinceJoining +
        monthlyAverage3Months * diffQueriedMonthCurrentMonth;

      // ADD TYPE & CATEGORY base projections (without projectedChanges) to each of 12 months
      let projections: Projection[] = [];
      let monthCounter = 0;
      let month = moment(date).startOf("month").toISOString();
      while (monthCounter <= 11) {
        savings = { ...savings, totalSinceJoining };
        typeAverages = { ...typeAverages };
        categoryAverages = { ...categoryAverages };
        let projectedChanges: ProjectedChange[] = [];

        const monthlyData = {
          savings,
          typeAverages,
          categoryAverages,
          month,
          projectedChanges,
        };
        projections.push(monthlyData);
        totalSinceJoining += monthlyAverage3Months;
        month = moment(month).add(1, "months").toISOString();
        monthCounter++;
      }

      // ADD projectedChanges for the dateRange of projections
      const projectedChanges = await getProjectedChanges(userId, date);
      if (projectedChanges && projectedChanges.length > 0) {
        for (let i = 0; i < projections.length; i++) {
          let projection = projections[i];
          let nextProjection: Projection | null;
          if (i < projections.length - 1) {
            nextProjection = projections[i + 1];
          } else nextProjection = null;

          for (let j = 0; j < projectedChanges.length; j++) {
            let projectedChange = projectedChanges[j];
            if (
              moment(projection.month).isSame(projectedChange.date, "month")
            ) {
              let type = projectedChange.type;
              projection.typeAverages[type] += projectedChange.amount;
              if (type === "expense") {
                projection.savings.monthlyAverage3Months -=
                  projectedChange.amount;
              } else {
                projection.savings.monthlyAverage3Months +=
                  projectedChange.amount;
              }
              if (nextProjection)
                nextProjection.savings.totalSinceJoining +=
                  projectedChange.amount;
            }
          }
        }
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
    res.status(201).send(newProjectedChange);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create projected change");
  }
}

async function getProjectedChanges(userId: string, date: string) {
  // Checks if user exists
  const user = await UserModel.getUser(userId);
  if (user) {
    // Get userId of user and all linked users
    const userIds = await UserModel.getUserIds(userId);
    const dateRangeProjectedChanges = dateRangeFromStartDate(date, 12);
    const projectedChanges =
      await ProjectionModel.findProjectedChangesByDateRange(
        userIds,
        dateRangeProjectedChanges
      );
    return projectedChanges;
  } else return null;
}

// async function getProjectedChanges(req: Request, res: Response) {
//   try {
//     const { userId, date } = req.body;
//     // Checks if user exists
//     const user = await UserModel.getUser(userId);
//     if (user) {
//       // Get userId of user and all linked users
//       const userIds = await UserModel.getUserIds(userId);
//       const dateRangeProjectedChanges = dateRangeFromStartDate(date, 12);
//       const projectedChanges =
//         await ProjectionModel.findProjectedChangesByDateRange(
//           userIds,
//           dateRangeProjectedChanges
//         );
//       res.status(200).send(projectedChanges);
//     } else res.status(400).send(`No user profile found for this userId`);
//   } catch (error) {
//     console.error(error);
//     res.status(400).send("Could not find projected changes");
//   }
// }

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
  // const endDate = moment(startDate).add(rangeInMonths, "months").toISOString();
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
