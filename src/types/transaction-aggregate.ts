import { UserId } from "./id";

type TransactionAggregate = {
  id: number;
  userId: UserId;
  year: number;
  month: number;
  monthName: string;
  periodType: string;
  categoriesForPeriod: any;
  incomeForPeriod: number;
  expensesForPeriod: number;
  savingsForPeriod: number;
  cumulativeSavingsSinceJoin: number;
  avgMonthlySavingsSinceJoin: number;
  monthsSinceJoin: number;
};

export default TransactionAggregate;
