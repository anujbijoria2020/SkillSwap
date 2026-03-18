-- Step 1: add receiverId as nullable so existing rows do not fail migration.
ALTER TABLE "Message" ADD COLUMN "receiverId" TEXT;

-- Step 2: backfill receiverId from the related swap participants.
UPDATE "Message" AS m
SET "receiverId" = CASE
  WHEN m."senderId" = s."initiatorId" THEN s."receiverId"
  WHEN m."senderId" = s."receiverId" THEN s."initiatorId"
  ELSE s."receiverId"
END
FROM "Swap" AS s
WHERE m."swapId" = s."id";

-- Step 3: enforce NOT NULL after backfill completes.
ALTER TABLE "Message" ALTER COLUMN "receiverId" SET NOT NULL;
