/*
  Warnings:

  - Added the required column `userName` to the `ActionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionLog" ADD COLUMN     "dealTitle" TEXT,
ADD COLUMN     "userName" TEXT NOT NULL;
