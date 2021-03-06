import prisma from "./db";
import { UserId } from "../types/id";
import { v4 as uuid } from "uuid";
import { ProjectedChange } from ".prisma/client";
import DateRange from "../types/dateRange";

async function getAverageByType(
  userIds: UserId[] | undefined,
  transactionType: string,
  dateRange: DateRange
) {
  try {
    // RETRIEVE AVERAGE THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      _count: {
        amount: true,
      },
      where: {
        userId: {
          in: userIds,
        },
        transactionType: {
          equals: transactionType,
        },
        date: {
          gte: dateRange.startDate,
          lt: dateRange.endDate,
        },
      },
    });
    return aggregations._avg.amount;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function getAverageByCategory(
  userIds: UserId[] | undefined,
  category: string,
  dateRange: DateRange
) {
  try {
    // RETRIEVE AVERAGE THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      _count: {
        amount: true,
      },
      where: {
        userId: {
          in: userIds,
        },
        category: {
          equals: category,
        },
        date: {
          gte: dateRange.startDate,
          lt: dateRange.endDate,
        },
      },
    });
    return aggregations._avg.amount;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function createProjectedChange(projectedChangeData: ProjectedChange) {
  try {
    const newProjectedChange = await prisma.projectedChange.create({
      data: { ...projectedChangeData, id: uuid() },
    });
    return newProjectedChange;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function findProjectedChangesByDateRange(
  userIds: UserId[] | undefined,
  dateRange: DateRange
) {
  try {
    const projectedChanges = prisma.projectedChange.findMany({
      where: {
        userId: {
          in: userIds,
        },
        date: {
          gte: dateRange.startDate,
          lt: dateRange.endDate,
        },
      },
    });
    return projectedChanges;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function deleteProjectedChange(projectedChangeId: string) {
  try {
    const deletedProjectedChange = await prisma.projectedChange.delete({
      where: {
        id: projectedChangeId,
      },
    });
    return deletedProjectedChange;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  getAverageByType,
  getAverageByCategory,
  createProjectedChange,
  findProjectedChangesByDateRange,
  deleteProjectedChange,
};
