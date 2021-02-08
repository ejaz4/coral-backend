-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'ja', 'fr', 'es');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cdnLocation" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL DEFAULT E'https://coral.video/images/user.svg',
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profilePicture" TEXT NOT NULL DEFAULT E'https://coral.video/images/user.svg',
    "preferedLanguage" "Language",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChannelToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelToUser_AB_unique" ON "_ChannelToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelToUser_B_index" ON "_ChannelToUser"("B");

-- AddForeignKey
ALTER TABLE "Video" ADD FOREIGN KEY("channelId")REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToUser" ADD FOREIGN KEY("A")REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToUser" ADD FOREIGN KEY("B")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
