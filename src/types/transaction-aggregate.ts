import { UserId } from "./id";

type TransactionAggregate = {
  userId: UserId;
  year: number;
  month: number; // JS month is zero-based, will store one-based on DB
  monthName: string;
  categoriesForPeriod: any;
  incomeForPeriod: number;
  expensesForPeriod: number;
  savingsForPeriod: number;
  cumulativeSavingsSinceJoin: number;
};

// TODO: descoped
// avgMonthlySavingsSinceJoin: number;
// monthsSinceJoin: number;

export default TransactionAggregate;
