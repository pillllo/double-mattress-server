import { UserId } from "./id";
import Category from "./category";

type TransactionAggregate = {
  id: number;
  userId: UserId;
  year: number;
  month: number;
  monthName: string;
  periodType: "month" | "year";
  categoriesForPeriod: {
    [key: string]: number;
  };
  incomeForPeriod: number;
  expensesForPeriod: number;
  savingsForPeriod: number;
  cumulativeSavingsSinceJoin: number;
  avgMonthlySavingsSinceJoin: number;
  monthsSinceJoin: number;
};

export default TransactionAggregate;
