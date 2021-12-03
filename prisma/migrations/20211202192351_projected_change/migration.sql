-- CreateTable
CREATE TABLE "ProjectedChange" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT E'EUR',
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "includeAvg" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectedChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectedChange_id_key" ON "ProjectedChange"("id");
