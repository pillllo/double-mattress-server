-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "currency" TEXT,
    "linkedUserId" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
