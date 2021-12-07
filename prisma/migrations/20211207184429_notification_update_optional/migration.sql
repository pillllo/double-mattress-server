-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "fromUserId" DROP NOT NULL,
ALTER COLUMN "fromUserName" DROP NOT NULL,
ALTER COLUMN "fromUserName" SET DEFAULT E'System';
