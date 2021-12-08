import { Request, Response } from "express";
import moment from "moment";
moment().format();
import { stripe } from "./subscription.controller";
import ProjectionModel from "../models/projection.model";
import UserModel from "../models/user.model";
import DateRange from "../types/dateRange";
import Projection, {
  CategoryAverages,
  Savings,
  TypeAverages,
} from "../types/projection";
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

// Calculate currentMonth data (object) based on average historical data
async function getProjections(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;
    // Checks if user exists, if not returns null
    const user = await UserModel.getUser(userId);

    if (user) {
      const projectionsForQueriedDate = await compileTotalProjections(
        userId,
        date
      );
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
// Return updated array of projections
async function createProjectedChange(req: Request, res: Response) {
  try {
    const { projectedChange, projectionsStartDate } = req.body;
    const newProjectedChange = await ProjectionModel.createProjectedChange(
      projectedChange
    );
    if (newProjectedChange) {
      const updatedProjections = await compileTotalProjections(
        projectedChange.userId,
        projectionsStartDate
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
// DELETE /projections
//----------------------------------------------------------------
async function deleteProjectedChange(req: Request, res: Response) {
  try {
    const { projectedChangeId, projectionsStartDate } = req.body;
    const deletedProjectedChange = await ProjectionModel.deleteProjectedChange(
      projectedChangeId
    );
    if (deletedProjectedChange) {
      const updatedProjections = await compileTotalProjections(
        deletedProjectedChange.userId,
        projectionsStartDate
      );
      res.status(201).send(updatedProjections);
    } else res.status(400).send("Could not delete the projected change");
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not delete the projected change");
  }
}

//----------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------

async function compileTotalProjections(userId: string, date: string) {
  try {
    // Get userId of user and all linked users
    const userIds = await UserModel.getUserIds(userId);

    // Get dateRangeForAvgCalc (with startDate and endDate) to query db for the average
    // endDate = first day of the current month | startDate first day of month 3 months ago
    const dateRangeForAvgCalc = dateRangeFromCurrentMonthIntoPast(3);

    // TYPES
    // Get type averages for base projections (avg value for each type, without projectedChanges)
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

    // CATEGORIES
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

    // Get category averages for base projections (avg value for each category, without projectedChanges)
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

    // SAVINGS
    // Calculate monthly savings
    let savings = { monthlySavings: 0, totalSinceJoining: 0 };
    const monthlySavings = typeAverages.income - typeAverages.expense;
    // Get total savings since joining
    let totalSinceJoining = 1000000;
    savings = { ...savings, monthlySavings, totalSinceJoining };

    // PROJECTIONS TIMELINE (first day of current month - 12 months from queried date)
    // For how many months should we create projections
    const monthsInProjections = monthCountProjections(date, 12);
    // For which dateRange should we create projections
    const dateRangeOfProjections = dateRangeProjections(date, 12);

    // BASE PROJECTIONS
    // Add base projections (without projectedChanges) to each of the months
    const projections = addBaseProjectionsToMonths(
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
    // Add projectedChanges (one-off) to the base projections
    if (projectedChanges)
      addProjectedChangesToProjections(projections, projectedChanges);

    // PROJECTIONS FOR QUERIED DATE
    // Only keep data for last 12 months (i.e. 12 months from queriedDate)
    const projectionsForQueriedDate = projections.slice(-12);
    return projectionsForQueriedDate;
  } catch (error) {
    console.error(error);
    return "Could not get projections";
  }
}

function addBaseProjectionsToMonths(
  monthsInProjections: number,
  savings: Savings,
  typeAverages: TypeAverages,
  categoryAverages: CategoryAverages
) {
  let projections: Projection[] = [];
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

  // Add cumulative savings (totalSinceJoining) based on monthly data
  calculateCumulativeSavings(projections);

  return projections;
}

// Calculate cumulative savings (totalSinceJoining)
// add previous' months monthlySavings rate to previous' months cumulative savings
function calculateCumulativeSavings(projections: Projection[]) {
  for (let i = 0; i < projections.length; i++) {
    let currentMonth = projections[i];
    let previousMonth: Projection | null = i > 0 ? projections[i - 1] : null;
    if (previousMonth)
      currentMonth.savings.totalSinceJoining =
        previousMonth.savings.totalSinceJoining +
        previousMonth.savings.monthlySavings;
  }
}

// Get all projectedChanges related to the userId and all linked users in a given dateRange
async function getProjectedChanges(userId: string, dateRange: DateRange) {
  // Checks if user exists, if not returns null
  const user = await UserModel.getUser(userId);
  if (user) {
    // Get userId of user and all linked users
    const userIds = await UserModel.getUserIds(userId);
    const projectedChanges =
      await ProjectionModel.findProjectedChangesByDateRange(userIds, dateRange);
    return projectedChanges;
  } else return null;
}

function addProjectedChangesToProjections(
  projections: Projection[],
  projectedChanges: ProjectedChange[]
) {
  if (projectedChanges.length > 0) {
    for (let i = 0; i < projections.length; i++) {
      let currentMonth = projections[i];

      // UPDATE monthlySavings, income & expense if any projectedChange falls into this month
      for (let j = 0; j < projectedChanges.length; j++) {
        let projectedChange = projectedChanges[j];
        if (moment(currentMonth.month).isSame(projectedChange.date, "month")) {
          let type = projectedChange.type;
          let category = projectedChange.category;
          currentMonth.typeAverages[type] += projectedChange.amount;
          currentMonth.categoryAverages[category] += projectedChange.amount;

          if (type === "expense") {
            currentMonth.savings.monthlySavings -= projectedChange.amount;
          } else {
            currentMonth.savings.monthlySavings += projectedChange.amount;
          }
          currentMonth.projectedChanges.push(projectedChange);

          if (projectedChange.includeAvg && i < projections.length - 1) {
            let recurringProjectedChange = JSON.parse(
              JSON.stringify(projectedChange)
            );
            let currentDate = recurringProjectedChange.date;
            recurringProjectedChange.date = moment(currentDate)
              .add(1, "months")
              .toISOString();
            projectedChanges.push(recurringProjectedChange);
          }
        }
      }
    }
    // Update cumulative savings (totalSinceJoining) based on monthly data
    calculateCumulativeSavings(projections);
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
  // const startMonth = moment(today);
  const startMonth = moment(today).startOf("month");
  const endMonth = moment(queriedDate).add(rangeInMonths - 1, "months");
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

const projectionController = {
  getProjections,
  createProjectedChange,
  getProjectedChanges,
  deleteProjectedChange,
};

export default projectionController;
