/*
  Warnings:

  - Made the column `currency` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "currency" SET NOT NULL;

-- CreateTable
CREATE TABLE "TransactionAggregate" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT E'month',
    "categoriesForPeriod" JSONB NOT NULL,
    "incomeForPeriod" INTEGER NOT NULL,
    "expensesForPeriod" INTEGER NOT NULL,
    "savingsForPeriod" INTEGER NOT NULL,
    "cumulativeSavingsSinceJoin" INTEGER NOT NULL,
    "avgMonthlySavingsSinceJoin" INTEGER NOT NULL,
    "monthsSinceJoin" INTEGER NOT NULL,

    CONSTRAINT "TransactionAggregate_pkey" PRIMARY KEY ("id")
);
