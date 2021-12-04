import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import Projection, { CategoryAverages } from "../types/projection";
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
      let categoryAverages = {
        Salary: 0,
        "Other Income": 0,
        "Bills and Services": 0,
        Home: 0,
        Shopping: 0,
        Entertainment: 0,
        "Eating Out": 0,
        Others: 0,
      };

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

      // ADD BASE PROJECTIONS (without projectedChanges) to each of 12 months
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
        month = moment(month).add(1, "months").toISOString();
        monthCounter++;
      }

      // ADD PROJECTED CHANGES (one-off) to the base projections for the dateRange of projections
      const projectedChanges = await getProjectedChanges(userId, date);
      if (projectedChanges) updateProjections(projections, projectedChanges);

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
    let { projectedChange, projections } = req.body;
    const newProjectedChange = await ProjectionModel.createProjectedChange(
      projectedChange
    );
    const projectedChanges = [projectedChange];
    const updatedProjections = updateProjections(projections, projectedChanges);
    res.status(201).send(updatedProjections);
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

function updateProjections(
  projections: Projection[],
  projectedChanges: ProjectedChange[]
) {
  if (projectedChanges.length > 0) {
    for (let i = 0; i < projections.length; i++) {
      let projection = projections[i];

      // UPDATE cumulative savings (totalSinceJoining) based on change in monthly saving in previous month
      // take previous projection's monthly savings rate
      // add to current base rate savings since joining
      let previousProjection: Projection | null =
        i > 0 ? projections[i - 1] : null;
      if (previousProjection)
        projection.savings.totalSinceJoining =
          previousProjection.savings.totalSinceJoining +
          previousProjection.savings.monthlyAverage3Months;

      // UPDATE monthly saving, income & expense if any projectedChange falls into this month
      for (let j = 0; j < projectedChanges.length; j++) {
        let projectedChange = projectedChanges[j];
        if (moment(projection.month).isSame(projectedChange.date, "month")) {
          let type = projectedChange.type;
          let category = projectedChange.category;
          projection.typeAverages[type] += projectedChange.amount;
          projection.categoryAverages[category] += projectedChange.amount;

          if (type === "expense") {
            projection.savings.monthlyAverage3Months -= projectedChange.amount;
          } else {
            projection.savings.monthlyAverage3Months += projectedChange.amount;
          }

          projection.projectedChanges.push(projectedChange);
        }
      }
    }
  }
  return projections;
}

const projectionController = {
  getProjections,
  createProjectedChange,
  getProjectedChanges,
};

export default projectionController;
