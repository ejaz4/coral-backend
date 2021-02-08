/*
  Warnings:

  - You are about to drop the column `preferedLanguage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferedLanguage",
ADD COLUMN     "language" "Language";
