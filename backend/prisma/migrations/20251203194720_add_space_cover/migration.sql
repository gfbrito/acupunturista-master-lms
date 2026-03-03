-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "isDynamicCover" BOOLEAN NOT NULL DEFAULT false;
