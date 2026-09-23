-- Add nullable column first so existing rows aren't broken by a NOT NULL default
ALTER TABLE "Worker" ADD COLUMN "employeeCode" TEXT;

-- Backfill existing rows with sequential codes ordered by creation time
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "Worker"
)
UPDATE "Worker"
SET "employeeCode" = 'EMP-' || LPAD(numbered.rn::text, 4, '0')
FROM numbered
WHERE "Worker"."id" = numbered."id";

-- Now that every row has a value, enforce NOT NULL + uniqueness
ALTER TABLE "Worker" ALTER COLUMN "employeeCode" SET NOT NULL;
CREATE UNIQUE INDEX "Worker_employeeCode_key" ON "Worker"("employeeCode");
