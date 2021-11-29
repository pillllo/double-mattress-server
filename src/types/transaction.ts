type Transaction = {
  // Change string to integer to be in line with prisma
  transactionId: string;
  transactionType: "income" | "expense";
  userId: string;
  amount: number;
  currency: string;
  category: string;
  date: string; // using ISO strings vs integer as they are human readable
  description: string;
  includeAvg?: boolean;
};

export default Transaction;
