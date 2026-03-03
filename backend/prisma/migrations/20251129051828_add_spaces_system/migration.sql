-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('DISCUSSION', 'COURSE', 'EVENT', 'MEMBERS', 'GALLERY', 'CHAT');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'SECRET');

-- CreateEnum
CREATE TYPE "SpaceRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "spaceId" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "spaceId" TEXT;

-- CreateTable
CREATE TABLE "space_groups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "spaceGroupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "type" "SpaceType" NOT NULL DEFAULT 'DISCUSSION',
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'PUBLIC',
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT,
    "autoJoinRule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SpaceRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "space_groups_slug_key" ON "space_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_slug_key" ON "spaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_spaceId_userId_key" ON "space_members"("spaceId", "userId");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_spaceGroupId_fkey" FOREIGN KEY ("spaceGroupId") REFERENCES "space_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
