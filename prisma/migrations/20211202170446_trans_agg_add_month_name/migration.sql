/*
  Warnings:

  - Added the required column `monthName` to the `TransactionAggregate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionAggregate" ADD COLUMN     "monthName" TEXT NOT NULL;
