-- CreateTable
CREATE TABLE "ReportFieldPreference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportFieldPreference_pkey" PRIMARY KEY ("id")
);
