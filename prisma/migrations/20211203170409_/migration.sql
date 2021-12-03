/*
  Warnings:

  - You are about to alter the column `cumulativeSavingsSinceJoin` on the `TransactionAggregate` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TransactionAggregate" ALTER COLUMN "cumulativeSavingsSinceJoin" SET DATA TYPE INTEGER;
