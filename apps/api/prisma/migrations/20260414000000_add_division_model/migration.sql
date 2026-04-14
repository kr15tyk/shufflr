-- CreateEnum
CREATE TYPE "DivisionFormat" AS ENUM ('TEAMS', 'SINGLES');

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "format" "DivisionFormat" NOT NULL,
    "maxTeams" INTEGER,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "divisionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "divisionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Division_seasonId_slug_key" ON "Division"("seasonId", "slug");

-- CreateIndex
CREATE INDEX "Division_seasonId_name_idx" ON "Division"("seasonId", "name");

-- CreateIndex
CREATE INDEX "Match_divisionId_idx" ON "Match"("divisionId");

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON UPDATE CASCADE;
