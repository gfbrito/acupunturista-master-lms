/*
  Warnings:

  - Added the required column `updatedAt` to the `lesson_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "lesson_progress" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "completedAt" DROP NOT NULL,
ALTER COLUMN "completedAt" DROP DEFAULT;
