-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResultSource" AS ENUM ('PLAYER', 'ADMIN');

-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "source" "ResultSource" NOT NULL DEFAULT 'PLAYER',
ADD COLUMN "status" "ResultStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
