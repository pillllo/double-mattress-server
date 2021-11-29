import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.create({
    data: {
      transactionType: "expenses",
      userId: "user_1",
      amount: 10000,
      currency: "EUR",
      category: "rent",
      date: "random string",
      description: "Apartment",
      includeAvg: true,
    },
  });

  const allTransactions = await prisma.transaction.findMany();
  console.dir(allTransactions, { depth: null });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
