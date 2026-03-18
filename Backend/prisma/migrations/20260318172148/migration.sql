/*
  Warnings:

  - The values [COMPLETED] on the enum `SwapStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `swapId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SwapStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."Swap" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Swap" ALTER COLUMN "status" TYPE "SwapStatus_new" USING ("status"::text::"SwapStatus_new");
ALTER TYPE "SwapStatus" RENAME TO "SwapStatus_old";
ALTER TYPE "SwapStatus_new" RENAME TO "SwapStatus";
DROP TYPE "public"."SwapStatus_old";
ALTER TABLE "Swap" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "Review_swapId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "swapId",
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionId_key" ON "Review"("sessionId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
