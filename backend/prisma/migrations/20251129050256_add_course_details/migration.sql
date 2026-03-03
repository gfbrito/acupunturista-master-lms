-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "defaultAccessDays" INTEGER NOT NULL DEFAULT 365,
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalHours" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
