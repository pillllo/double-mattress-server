const mockTransactions = [
  {
    _id: 1,
    transactionId: "1",
    transactionType: "income",
    userId: "user_a",
    otherUserId: "user_b",
    amount: 10000,
    currency: "EUR",
    category: "salary",
    date: 1638024407331,
    description: "Monthly salary",
    includeAvg: true,
  },
  {
    _id: 2,
    transactionId: "2",
    transactionType: "expense",
    userId: "user_b",
    otherUserId: "user_a",
    amount: 90000,
    currency: "EUR",
    category: "Rent",
    date: 1638024407331,
    description: "Rent",
    includeAvg: true,
  },
  {
    _id: 3,
    transactionId: "3",
    transactionType: "expense",
    userId: "user_a",
    otherUserId: "user_b",
    amount: 30000,
    currency: "EUR",
    category: "Shopping",
    date: 1638024407331,
    description: "Groceries",
    includeAvg: true,
  },
  {
    _id: 4,
    transactionId: "4",
    transactionType: "expense",
    userId: "user_c",
    otherUserId: "user_d",
    amount: 20000,
    currency: "EUR",
    category: "Shopping",
    date: 1638024407331,
    description: "Groceries",
    includeAvg: true,
  },
];

export default mockTransactions;