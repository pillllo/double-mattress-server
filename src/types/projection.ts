import { ProjectedChange } from ".prisma/client";

type Projection = {
  savings: Savings;
  typeAverages: TypeAverages;
  categoryAverages: CategoryAverages;
  month: string;
  projectedChanges: ProjectedChange[];
};

export type Savings = {
  monthlySavings: number;
  totalSinceJoining: number;
};

export type TypeAverages = {
  income: number;
  expense: number;
  [key: string]: number;
};

export type CategoryAverages = {
  Salary: number;
  "Other Income": number;
  "Bills and Services": number;
  Home: number;
  Shopping: number;
  Entertainment: number;
  "Eating Out": number;
  Others: number;
  [key: string]: number;
};

export default Projection;
