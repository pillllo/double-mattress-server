type Projection = {
  savings: Savings;
  typeAverages: TypeAverages;
  categoryAverages: CategoryAverages;
  month: string;
};

type Savings = {
  monthlyAverage3Months: number;
  totalSinceJoining: number;
};

type TypeAverages = {
  income: number;
  expense: number;
};

type CategoryAverages = {
  Salary?: number;
  "Other Income"?: number;
  "Bills and Services"?: number;
  Home?: number;
  Shopping?: number;
  Entertainment?: number;
  "Eating Out"?: number;
  Others?: number;
};

export default Projection;
