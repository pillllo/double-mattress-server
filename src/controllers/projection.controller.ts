import { Request, Response } from "express";
import moment from "moment";
moment().format();
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import Projection, {
  CategoryAverages,
  Savings,
  TypeAverages,
} from "../types/projection";
import DateRange from "../types/dateRange";
import { ProjectedChange } from ".prisma/client";

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

//----------------------------------------------------------------
// POST /projections
//----------------------------------------------------------------

// Calculate projection data (object) based on average historical data
async function getProjections(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;

    // Checks if user exists, if not returns null
    const user = await UserModel.getUser(userId);

    if (user) {
      // Get userId of user and all linked users
      const userIds = await UserModel.getUserIds(userId);

      // Get dateRangeForAvgCalc (with startDate and endDate) to query db for the average
      // endDate = first day of the current month | startDate first day of month 3 months ago
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

      // SAVINGS: calculate monthly savings
      let savings = { monthlySavings: 0, totalSinceJoining: 0 };
      const monthlySavings = typeAverages.income - typeAverages.expense;
      // SAVINGS: get total savings since joining
      let totalSinceJoining = 1000000;
      savings = { ...savings, monthlySavings, totalSinceJoining };

      // PROJECTIONS TIMELINE: first day of current month - 12 months from queried date
      // For how many months should we create projections
      const monthsInProjections = monthCountProjections(date, 12);
      // For which dateRange should we create projections
      const dateRangeOfProjections = dateRangeProjections(date, 12);
      console.log("🎯 monthsInProj", monthsInProjections);
      console.log("🎯 dateRangeProj", dateRangeOfProjections);

      // ADD BASE PROJECTIONS: (without projectedChanges) to each of the months
      const projections = addProjectionsToMonths(
        monthsInProjections,
        savings,
        typeAverages,
        categoryAverages
      );

      // PROJECTED CHANGES
      // Get all projectedChanges for the dateRange of projections
      const projectedChanges = await getProjectedChanges(
        userId,
        dateRangeOfProjections
      );

      // Add projectedChanges (one-off) to the base projections for the dateRange of projections
      if (projectedChanges) updateProjections(projections, projectedChanges);

      const projectionsForQueriedDate = projections.slice(-12);
      console.log("🎯 ", projectionsForQueriedDate.length);
      // res.status(200).send(projections);
      res.status(200).send(projectionsForQueriedDate);
    } else res.status(400).send(`No user profile found for userId: ${userId}`);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get projections");
  }
}

//----------------------------------------------------------------
// POST /projections/create
//----------------------------------------------------------------

// Create a new projectedChange in the db
async function createProjectedChange(req: Request, res: Response) {
  try {
    let { projectedChange, projections } = req.body;
    const newProjectedChange = await ProjectionModel.createProjectedChange(
      projectedChange
    );
    if (newProjectedChange) {
      const projectedChanges = [newProjectedChange];
      const updatedProjections = updateProjections(
        projections,
        projectedChanges
      );
      res.status(201).send(updatedProjections);
    } else {
      res.status(400).send("Could not create projected change");
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not create projected change");
  }
}

//----------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------

function addProjectionsToMonths(
  monthsInProjections: number,
  savings: Savings,
  typeAverages: TypeAverages,
  categoryAverages: CategoryAverages
) {
  let projections: Projection[] = [];
  // let monthCounter = 0;
  let today = new Date();
  let month = moment(today).startOf("month").toISOString();

  for (let i = 0; i <= monthsInProjections; i++) {
    savings = { ...savings };
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
  }
  // while (monthCounter <= monthsInProjections) {
  //   savings = { ...savings };
  //   typeAverages = { ...typeAverages };
  //   categoryAverages = { ...categoryAverages };
  //   let projectedChanges: ProjectedChange[] = [];

  //   const monthlyData = {
  //     savings,
  //     typeAverages,
  //     categoryAverages,
  //     month,
  //     projectedChanges,
  //   };
  //   projections.push(monthlyData);
  //   month = moment(month).add(1, "months").toISOString();
  //   monthCounter++;
  // }
  return projections;
}

async function getProjectedChanges(userId: string, dateRange: DateRange) {
  // Checks if user exists
  const user = await UserModel.getUser(userId);
  if (user) {
    // Get userId of user and all linked users
    const userIds = await UserModel.getUserIds(userId);
    const projectedChanges =
      await ProjectionModel.findProjectedChangesByDateRange(userIds, dateRange);
    return projectedChanges;
  } else return null;
}

function updateProjections(
  projections: Projection[],
  projectedChanges: ProjectedChange[]
) {
  if (projectedChanges.length > 0) {
    for (let i = 0; i < projections.length; i++) {
      let projection = projections[i];

      // UPDATE cumulative savings (totalSinceJoining) based on change in monthlySavings saving in previous month
      // take previous projection's monthlySavings savings rate
      // add to current base rate savings since joining
      let previousProjection: Projection | null =
        i > 0 ? projections[i - 1] : null;
      if (previousProjection)
        projection.savings.totalSinceJoining =
          previousProjection.savings.totalSinceJoining +
          previousProjection.savings.monthlySavings;

      // UPDATE monthlySavings saving, income & expense if any projectedChange falls into this month
      for (let j = 0; j < projectedChanges.length; j++) {
        let projectedChange = projectedChanges[j];
        if (moment(projection.month).isSame(projectedChange.date, "month")) {
          let type = projectedChange.type;
          let category = projectedChange.category;
          projection.typeAverages[type] += projectedChange.amount;
          projection.categoryAverages[category] += projectedChange.amount;

          if (type === "expense") {
            projection.savings.monthlySavings -= projectedChange.amount;
          } else {
            projection.savings.monthlySavings += projectedChange.amount;
          }

          projection.projectedChanges.push(projectedChange);
        }
      }
    }
  }
  return projections;
}

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

// Returns amount of months between current month,
// and X months from the queriedDate
function monthCountProjections(queriedDate: string, rangeInMonths: number) {
  const today = new Date();
  const startMonth = moment(today);
  const endMonth = moment(queriedDate).add(rangeInMonths, "months");
  const monthCountProjections = endMonth.diff(startMonth, "months");
  return monthCountProjections;
}

// Returns startDate & endDate of a dateRange with
// startDate = first day of the current month
// endDate = first day of the month, X months from the queriedDate
function dateRangeProjections(queriedDate: string, rangeInMonths: number) {
  const today = new Date();
  const startDate = moment(today).startOf("month").toISOString();
  const endDate = moment(queriedDate)
    .add(rangeInMonths - 1, "months")
    .startOf("month")
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

// // set start value depending on diff in months from current months
// // calculate number of months between queried month and current month
// const diffQueriedMonthCurrentMonth = monthsDiffFromCurrentMonth(date);
// // get totalSinceJoining by multiplying months since since current month * average savings / months
// totalSinceJoining =
//   totalSinceJoining + monthlySavings * diffQueriedMonthCurrentMonth;

// // Returns difference, in months, between the queried date
// // and the current month
// function monthsDiffFromCurrentMonth(date: string) {
//   const today = new Date();
//   var currentMonth = moment(today);
//   var queriedMonth = moment(date);
//   const monthsDiffFromCurrentMonth = queriedMonth.diff(currentMonth, "months");
//   return monthsDiffFromCurrentMonth;
// }

const projectionController = {
  getProjections,
  createProjectedChange,
  getProjectedChanges,
};

export default projectionController;
