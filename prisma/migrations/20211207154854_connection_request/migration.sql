-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "read" SET DEFAULT false;

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" SERIAL NOT NULL,
    "initiatingUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedOn" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'open',

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);
