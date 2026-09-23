-- CreateEnum
CREATE TYPE "RepaymentBucket" AS ENUM ('MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "AdvanceRepayment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "bucket" "RepaymentBucket" NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvanceRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdvanceRepayment_workerId_bucket_idx" ON "AdvanceRepayment"("workerId", "bucket");

-- CreateIndex
CREATE INDEX "AdvanceRepayment_date_idx" ON "AdvanceRepayment"("date");

-- AddForeignKey
ALTER TABLE "AdvanceRepayment" ADD CONSTRAINT "AdvanceRepayment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
