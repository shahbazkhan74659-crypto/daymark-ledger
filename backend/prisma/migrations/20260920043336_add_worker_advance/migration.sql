-- CreateTable
CREATE TABLE "Advance" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Advance_date_idx" ON "Advance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Advance_workerId_date_key" ON "Advance"("workerId", "date");

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
