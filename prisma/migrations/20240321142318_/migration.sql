/*
  Warnings:

  - You are about to drop the column `LY90QCGW000001384573179002880` on the `admins` table. All the data in the column will be lost.
  - Added the required column `name` to the `admins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "LY90QCGW000001384573179002880",
ADD COLUMN     "name" TEXT NOT NULL;
