import { Request, Response } from "express";
import ProjectionModel from "../models/projection.model";

async function getProjections(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;
    // Assumes that client always sends date as first day of the queried month
    const dateRange = setDateRange(date);
    // TODO: create helperfunction that a) checks if user exists, b) gets allUserIds
    const incomeAvg = await ProjectionModel.getAverageByType(
      userId,
      "income",
      dateRange
    );
    const expensesAvg = await ProjectionModel.getAverageByType(
      userId,
      "expense",
      dateRange
    );
    console.log(`${incomeAvg}, ${expensesAvg}`);
    res.status(200).send({ incomeAvg, expensesAvg });
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get projections");
  }
}

// HELPER FUNCTIONS

function setDateRange(endDate: string) {
  let d = new Date(endDate);
  let subtractThreeMonts = d.setMonth(d.getMonth() - 3);
  let startDate = new Date(subtractThreeMonts).toISOString();
  return { startDate, endDate };
}

const projectionController = {
  getProjections,
};

export default projectionController;
