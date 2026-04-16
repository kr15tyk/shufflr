import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { rankTeams, StandingsService, TeamStats } from './standings.service';

// ─── rankTeams unit tests ────────────────────────────────────────────────────

describe('rankTeams', () => {
  it('simple scenario: clear winner is ranked first', () => {
    const teams: TeamStats[] = [
      {
        teamId: 'b',
        teamName: 'Team B',
        wins: 1,
        losses: 2,
        ties: 0,
        pointsScored: 10,
        pointsAllowed: 20,
        pointDifferential: -10,
        winPercentage: 1 / 3,
      },
      {
        teamId: 'a',
        teamName: 'Team A',
        wins: 3,
        losses: 0,
        ties: 0,
        pointsScored: 30,
        pointsAllowed: 10,
        pointDifferential: 20,
        winPercentage: 1,
      },
    ];

    const ranked = rankTeams(teams);

    expect(ranked[0].teamId).toBe('a');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].teamId).toBe('b');
    expect(ranked[1].rank).toBe(2);
  });

  it('tie on wins resolved by pointDifferential (desc)', () => {
    const teams: TeamStats[] = [
      {
        teamId: 'x',
        teamName: 'Team X',
        wins: 2,
        losses: 1,
        ties: 0,
        pointsScored: 20,
        pointsAllowed: 25,
        pointDifferential: -5,
        winPercentage: 2 / 3,
      },
      {
        teamId: 'y',
        teamName: 'Team Y',
        wins: 2,
        losses: 1,
        ties: 0,
        pointsScored: 30,
        pointsAllowed: 20,
        pointDifferential: 10,
        winPercentage: 2 / 3,
      },
    ];

    const ranked = rankTeams(teams);

    expect(ranked[0].teamId).toBe('y'); // better pointDifferential
    expect(ranked[1].teamId).toBe('x');
  });

  it('multi-team tie resolved by full tiebreaker chain', () => {
    // All 3 teams have equal wins and pointDifferential
    // Tiebreaker goes to pointsScored, then teamName
    const teams: TeamStats[] = [
      {
        teamId: 'c',
        teamName: 'Zebras',
        wins: 2,
        losses: 1,
        ties: 0,
        pointsScored: 25,
        pointsAllowed: 15,
        pointDifferential: 10,
        winPercentage: 2 / 3,
      },
      {
        teamId: 'a',
        teamName: 'Alphas',
        wins: 2,
        losses: 1,
        ties: 0,
        pointsScored: 30,
        pointsAllowed: 20,
        pointDifferential: 10,
        winPercentage: 2 / 3,
      },
      {
        teamId: 'b',
        teamName: 'Betas',
        wins: 2,
        losses: 1,
        ties: 0,
        pointsScored: 30,
        pointsAllowed: 20,
        pointDifferential: 10,
        winPercentage: 2 / 3,
      },
    ];

    const ranked = rankTeams(teams);

    // a and b have same wins, pointDiff, pointsScored → sorted by name asc
    expect(ranked[0].teamId).toBe('a'); // Alphas comes before Betas alphabetically
    expect(ranked[1].teamId).toBe('b'); // Betas
    expect(ranked[2].teamId).toBe('c'); // Zebras (lower pointsScored)
  });

  it('stable/deterministic: same input always produces same output', () => {
    const teams: TeamStats[] = [
      {
        teamId: '2',
        teamName: 'Team B',
        wins: 1,
        losses: 0,
        ties: 0,
        pointsScored: 10,
        pointsAllowed: 5,
        pointDifferential: 5,
        winPercentage: 1,
      },
      {
        teamId: '1',
        teamName: 'Team A',
        wins: 1,
        losses: 0,
        ties: 0,
        pointsScored: 10,
        pointsAllowed: 5,
        pointDifferential: 5,
        winPercentage: 1,
      },
    ];

    const first = rankTeams(teams).map((t) => t.teamId);
    const second = rankTeams(teams).map((t) => t.teamId);

    expect(first).toEqual(second);
    // Team A should be ranked first alphabetically
    expect(first[0]).toBe('1');
  });
});

// ─── StandingsService unit tests ─────────────────────────────────────────────

describe('StandingsService', () => {
  let service: StandingsService;
  let prismaMock: {
    match: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      match: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StandingsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<StandingsService>(StandingsService);
  });

  function buildMatch(
    matchId: string,
    teamAId: string,
    teamAName: string,
    teamBId: string,
    teamBName: string,
    scoreA: number,
    scoreB: number,
  ) {
    return {
      id: matchId,
      seasonId: 'season-1',
      divisionId: 'div-1',
      teamAId,
      teamBId,
      result: { scoreA, scoreB, status: 'APPROVED' },
      teamA: { id: teamAId, name: teamAName },
      teamB: { id: teamBId, name: teamBName },
    };
  }

  it('returns an empty list when no approved matches exist', async () => {
    prismaMock.match.findMany.mockResolvedValue([]);

    const standings = await service.getStandings('season-1', 'div-1');

    expect(standings).toEqual([]);
  });

  it('calculates wins, losses, pointsScored, pointsAllowed correctly', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 5, 2),
    ]);

    const standings = await service.getStandings('season-1', 'div-1');

    const teamA = standings.find((s) => s.teamId === 'team-a')!;
    const teamB = standings.find((s) => s.teamId === 'team-b')!;

    expect(teamA.wins).toBe(1);
    expect(teamA.losses).toBe(0);
    expect(teamA.pointsScored).toBe(5);
    expect(teamA.pointsAllowed).toBe(2);
    expect(teamA.pointDifferential).toBe(3);
    expect(teamA.winPercentage).toBe(1);

    expect(teamB.wins).toBe(0);
    expect(teamB.losses).toBe(1);
    expect(teamB.pointsScored).toBe(2);
    expect(teamB.pointsAllowed).toBe(5);
    expect(teamB.pointDifferential).toBe(-3);
    expect(teamB.winPercentage).toBe(0);
  });

  it('records a tie when scores are equal', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 3, 3),
    ]);

    const standings = await service.getStandings('season-1', 'div-1');

    const teamA = standings.find((s) => s.teamId === 'team-a')!;
    expect(teamA.ties).toBe(1);
    expect(teamA.wins).toBe(0);
    expect(teamA.losses).toBe(0);
    expect(teamA.winPercentage).toBe(0);
  });

  it('ranks the team with most wins first', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 5, 2),
      buildMatch('m2', 'team-a', 'Team A', 'team-b', 'Team B', 4, 1),
    ]);

    const standings = await service.getStandings('season-1', 'div-1');

    expect(standings[0].teamId).toBe('team-a');
    expect(standings[0].rank).toBe(1);
    expect(standings[1].teamId).toBe('team-b');
    expect(standings[1].rank).toBe(2);
  });

  it('returns cached result on subsequent call within TTL', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 5, 2),
    ]);

    await service.getStandings('season-1', 'div-1');
    await service.getStandings('season-1', 'div-1');

    // findMany should only be called once because second call uses cache
    expect(prismaMock.match.findMany).toHaveBeenCalledTimes(1);
  });

  it('invalidates cache and re-fetches on match.result.approved event', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 5, 2),
    ]);
    prismaMock.match.findUnique.mockResolvedValue({ seasonId: 'season-1' });

    // Prime the cache
    await service.getStandings('season-1', 'div-1');

    // Fire the event handler (simulating an event)
    await service.handleMatchApproved({ matchId: 'match-new', divisionId: 'div-1' });

    // Should re-query after cache invalidation
    await service.getStandings('season-1', 'div-1');

    expect(prismaMock.match.findMany).toHaveBeenCalledTimes(2);
  });

  it('includes rank number in each entry', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      buildMatch('m1', 'team-a', 'Team A', 'team-b', 'Team B', 5, 2),
    ]);

    const standings = await service.getStandings('season-1', 'div-1');

    expect(standings.every((s) => typeof s.rank === 'number')).toBe(true);
    expect(standings[0].rank).toBe(1);
  });

  it('does not include divisionId filter when divisionId is not provided', async () => {
    prismaMock.match.findMany.mockResolvedValue([]);

    await service.getStandings('season-1');

    expect(prismaMock.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ divisionId: expect.anything() }),
      }),
    );
  });
});
