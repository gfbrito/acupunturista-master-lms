-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "bannerUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "customRoleId" TEXT,
ADD COLUMN     "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyByWhatsapp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "surname" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hasFullAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "custom_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomRoleToSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseToCustomRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CustomPageToCustomRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_name_key" ON "custom_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "polls_postId_key" ON "polls"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_pollId_userId_key" ON "poll_votes"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_pages_slug_key" ON "custom_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomRoleToSpace_AB_unique" ON "_CustomRoleToSpace"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomRoleToSpace_B_index" ON "_CustomRoleToSpace"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToCustomRole_AB_unique" ON "_CourseToCustomRole"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToCustomRole_B_index" ON "_CourseToCustomRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomPageToCustomRole_AB_unique" ON "_CustomPageToCustomRole"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomPageToCustomRole_B_index" ON "_CustomPageToCustomRole"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "poll_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomRoleToSpace" ADD CONSTRAINT "_CustomRoleToSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomRoleToSpace" ADD CONSTRAINT "_CustomRoleToSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToCustomRole" ADD CONSTRAINT "_CourseToCustomRole_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToCustomRole" ADD CONSTRAINT "_CourseToCustomRole_B_fkey" FOREIGN KEY ("B") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomPageToCustomRole" ADD CONSTRAINT "_CustomPageToCustomRole_A_fkey" FOREIGN KEY ("A") REFERENCES "custom_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomPageToCustomRole" ADD CONSTRAINT "_CustomPageToCustomRole_B_fkey" FOREIGN KEY ("B") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
