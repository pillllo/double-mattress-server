import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.create({
    data: {
      transactionId: uuid(),
      transactionType: "expenses",
      userId: "1",
      amount: 10000,
      currency: "EUR",
      category: "rent",
      date: "2021-11-29T17:54:33.422Z",
      description: "Apartment",
      includeAvg: true,
    },
  });

  const allUsers = await prisma.user.findMany();
  console.dir(allUsers, { depth: null });

  await prisma.user.create({
    data: {
      userId: uuid(),
      firstName: "Natalie",
      currency: "EUR",
      linkedUserId: ["2"],
    },
  });

  const allTransactions = await prisma.user.findMany();
  console.dir(allTransactions, { depth: null });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
