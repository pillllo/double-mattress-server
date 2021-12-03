/*
  Warnings:

  - You are about to drop the column `avgMonthlySavingsSinceJoin` on the `TransactionAggregate` table. All the data in the column will be lost.
  - You are about to drop the column `monthsSinceJoin` on the `TransactionAggregate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TransactionAggregate" DROP COLUMN "avgMonthlySavingsSinceJoin",
DROP COLUMN "monthsSinceJoin";
