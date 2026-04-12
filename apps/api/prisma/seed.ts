import { PrismaClient, UserRole, SeasonStatus } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // ── Organization ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      name: "Demo Sports Club",
      subdomain: "demo",
      logoUrl: null,
      primaryColor: "#4F46E5",
      contactEmail: "admin@demo.shufflr.app",
    },
  });

  console.log(`Organization: ${org.name} (${org.id})`);

  // ── Admin user ────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email_organizationId: { email: "admin@demo.shufflr.app", organizationId: org.id } },
    update: {},
    create: {
      email: "admin@demo.shufflr.app",
      // bcrypt hash of "Shufflr@Demo2026!" – change this before deploying to production
      passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      name: "Demo Admin",
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });

  console.log(`Admin user: ${admin.email} (${admin.id})`);

  // ── League ────────────────────────────────────────────────────────────────
  const league = await prisma.league.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Recreational Padel League",
      organizationId: org.id,
      format: "round-robin",
      scoringRules: {
        setsToWin: 2,
        gamesPerSet: 6,
        tiebreakAt: 6,
        goldenPoint: true,
      },
    },
  });

  console.log(`League: ${league.name} (${league.id})`);

  // ── Season ────────────────────────────────────────────────────────────────
  const season = await prisma.season.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      leagueId: league.id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-08-31"),
      status: SeasonStatus.DRAFT,
    },
  });

  console.log(`Season: ${season.id} (${season.status})`);

  // ── Courts ────────────────────────────────────────────────────────────────
  const courtData = [
    { name: "Court 1", surfaceType: "artificial-grass" },
    { name: "Court 2", surfaceType: "artificial-grass" },
    { name: "Court 3", surfaceType: "hard" },
  ];

  for (const [index, data] of courtData.entries()) {
    const court = await prisma.court.upsert({
      where: {
        id: `00000000-0000-0000-0000-00000000000${index + 3}`,
      },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000000${index + 3}`,
        organizationId: org.id,
        name: data.name,
        surfaceType: data.surfaceType,
        isActive: true,
      },
    });

    console.log(`Court: ${court.name} (${court.id})`);
  }

  console.log("\nSeed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
