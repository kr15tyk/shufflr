-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "surfaceColor" TEXT,
    "textColor" TEXT,
    "fontHeading" TEXT,
    "fontBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemeSettings_organizationId_key" ON "ThemeSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
