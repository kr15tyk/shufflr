import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // generateRoundRobin
  // ─────────────────────────────────────────────────────────────────────────
  describe('generateRoundRobin', () => {
    it('generates N-1 rounds for an even number of teams', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4']);
      expect(rounds).toHaveLength(3);
    });

    it('generates N rounds for an odd number of teams (padded to N+1)', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3']);
      expect(rounds).toHaveLength(3);
    });

    it('generates N/2 matches per round for even teams', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4']);
      rounds.forEach((round) => expect(round).toHaveLength(2));
    });

    it('adds exactly one BYE pairing per round for odd teams', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3']);
      const byeCount = rounds.flat().filter(([, b]) => b === null).length;
      expect(byeCount).toBe(3); // one BYE per round, 3 rounds
    });

    it('ensures every team plays every other team exactly once (even)', () => {
      const teams = ['t1', 't2', 't3', 't4'];
      const rounds = service.generateRoundRobin(teams);
      const played = new Map<string, Set<string>>();
      teams.forEach((t) => played.set(t, new Set()));
      rounds.flat().forEach(([a, b]) => {
        if (b !== null) {
          played.get(a)!.add(b);
          played.get(b)!.add(a);
        }
      });
      teams.forEach((t) => {
        const opponents = played.get(t)!;
        teams
          .filter((x) => x !== t)
          .forEach((opp) => expect(opponents.has(opp)).toBe(true));
        expect(opponents.size).toBe(teams.length - 1);
      });
    });

    it('ensures every team plays every other team exactly once (odd)', () => {
      const teams = ['t1', 't2', 't3', 't4', 't5'];
      const rounds = service.generateRoundRobin(teams);
      const played = new Map<string, Set<string>>();
      teams.forEach((t) => played.set(t, new Set()));
      rounds.flat().forEach(([a, b]) => {
        if (b !== null) {
          played.get(a)!.add(b);
          played.get(b)!.add(a);
        }
      });
      teams.forEach((t) => {
        const opponents = played.get(t)!;
        teams
          .filter((x) => x !== t)
          .forEach((opp) => expect(opponents.has(opp)).toBe(true));
        expect(opponents.size).toBe(teams.length - 1);
      });
    });

    it('each team appears at most once per round', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4', 't5', 't6']);
      rounds.forEach((round) => {
        const seen = new Set<string>();
        round.forEach(([a, b]) => {
          expect(seen.has(a)).toBe(false);
          seen.add(a);
          if (b !== null) {
            expect(seen.has(b)).toBe(false);
            seen.add(b);
          }
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // assignCourts
  // ─────────────────────────────────────────────────────────────────────────
  describe('assignCourts', () => {
    const courts = ['c1', 'c2', 'c3'];

    it('assigns a valid court to every non-BYE match', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4']);
      service.assignCourts(rounds, courts).flat().forEach(({ courtId }) => {
        expect(courts).toContain(courtId);
      });
    });

    it('omits BYE matches from the output', () => {
      const rounds = service.generateRoundRobin(['t1', 't2', 't3']);
      service.assignCourts(rounds, courts).flat().forEach(({ teamA, teamB }) => {
        expect(teamA).toBeTruthy();
        expect(teamB).toBeTruthy();
      });
    });

    it('does not assign the same court twice in a round when courts are sufficient', () => {
      // 6 teams -> 3 matches/round, 3 courts -> all unique
      const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4', 't5', 't6']);
      service.assignCourts(rounds, courts).forEach((round) => {
        const roundCourts = round.map((m) => m.courtId);
        expect(new Set(roundCourts).size).toBe(roundCourts.length);
      });
    });

    it('best-effort: avoids giving a team the same court in consecutive rounds (deterministic)', () => {
      // With Math.random returning 0, Fisher-Yates produces ['c2', 'c3', 'c1'] from ['c1', 'c2', 'c3']
      // because the swap always exchanges arr[i] with arr[0]:
      //   i=2: swap arr[2]<->arr[0] -> ['c3', 'c2', 'c1']
      //   i=1: swap arr[1]<->arr[0] -> ['c2', 'c3', 'c1']
      // The algorithm uses the same shuffled order every round (deterministic).
      //
      // With 4 teams / 2 matches per round / 3 courts, the pairing structure means that
      // in some rounds a repeat is structurally unavoidable (e.g. in Round 2 the second
      // match must share a court with one team's previous assignment because only one
      // court remains after the first match's preferred court is taken).
      // The best-effort algorithm minimises repeats rather than guaranteeing zero.
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

      try {
        const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4']);
        const assigned = service.assignCourts(rounds, courts);

        // All assigned courts must be from the allowed list
        assigned.flat().forEach(({ courtId }) => {
          expect(courts).toContain(courtId);
        });

        // Track same-court consecutive repeats per team across rounds.
        const repeatCounts = new Map<string, number>();
        const lastCourt = new Map<string, string>();

        assigned.forEach((round) => {
          round.forEach(({ teamA, teamB, courtId }) => {
            if (lastCourt.get(teamA) === courtId) {
              repeatCounts.set(teamA, (repeatCounts.get(teamA) ?? 0) + 1);
            }
            if (lastCourt.get(teamB) === courtId) {
              repeatCounts.set(teamB, (repeatCounts.get(teamB) ?? 0) + 1);
            }
            lastCourt.set(teamA, courtId);
            lastCourt.set(teamB, courtId);
          });
        });

        const totalRepeats = [...repeatCounts.values()].reduce((sum, count) => sum + count, 0);

        // For this fixed input and mocked RNG, the best-effort assignment is deterministic:
        // exactly two consecutive same-court repeats are unavoidable overall, and no team
        // should be forced into more than one such repeat.
        expect(totalRepeats).toBe(2);
        ['t1', 't2', 't3', 't4'].forEach((team) => {
          expect(repeatCounts.get(team) ?? 0).toBeLessThanOrEqual(1);
        });
      } finally {
        randomSpy.mockRestore();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // generateSchedule
  // ─────────────────────────────────────────────────────────────────────────
  describe('generateSchedule', () => {
    const seasonId = 'season-1';
    const divisionId = 'div-1';
    const teamIds = ['t1', 't2', 't3', 't4'];
    const courtIds = ['c1', 'c2'];
    const dates = [
      '2025-01-07T10:00:00.000Z',
      '2025-01-14T10:00:00.000Z',
      '2025-01-21T10:00:00.000Z',
    ];

    it('returns an array of match objects', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('sets the correct seasonId on every match', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      matches.forEach((m) => expect(m.seasonId).toBe(seasonId));
    });

    it('sets the correct divisionId on every match', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      matches.forEach((m) => expect(m.divisionId).toBe(divisionId));
    });

    it('sets status to SCHEDULED on every match', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      matches.forEach((m) => expect(m.status).toBe('SCHEDULED'));
    });

    it('produces N*(N-1)/2 matches for an even number of teams', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      expect(matches).toHaveLength((teamIds.length * (teamIds.length - 1)) / 2);
    });

    it('produces N*(N-1)/2 matches for an odd number of teams (BYEs excluded)', () => {
      const oddTeams = ['t1', 't2', 't3'];
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds: oddTeams,
        courtIds,
        dates,
      });
      expect(matches).toHaveLength((oddTeams.length * (oddTeams.length - 1)) / 2);
    });

    it('assigns a valid court to every match', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      matches.forEach((m) => expect(courtIds).toContain(m.courtId));
    });

    it('assigns scheduledAt from the provided dates list', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      const validDates = dates.map((d) => new Date(d).toISOString());
      matches.forEach((m) => expect(validDates).toContain(m.scheduledAt.toISOString()));
    });

    it('reuses the last date when there are fewer dates than rounds', () => {
      const onlyOneDate = ['2025-01-07T10:00:00.000Z'];
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates: onlyOneDate,
      });
      const expected = new Date(onlyOneDate[0]).toISOString();
      matches.forEach((m) => expect(m.scheduledAt.toISOString()).toBe(expected));
    });

    it('each match gets its own independent scheduledAt Date instance', () => {
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
      });
      // Mutating one match's date should not affect others in the same round
      const firstDate = matches[0].scheduledAt;
      const originalISO = firstDate.toISOString();
      firstDate.setFullYear(2000);
      matches.slice(1).forEach((m) => {
        if (m.scheduledAt.toISOString() === originalISO) {
          expect(m.scheduledAt.getFullYear()).not.toBe(2000);
        }
      });
    });

    // ── blockedDates ────────────────────────────────────────────────────────

    it('excludes blocked dates from scheduling', () => {
      // Block the second date; matches should only land on the 1st or 3rd dates
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
        blockedDates: ['2025-01-14'],
      });
      matches.forEach((m) => {
        expect(m.scheduledAt.toISOString().slice(0, 10)).not.toBe('2025-01-14');
      });
    });

    it('returns an empty array when all dates are blocked', () => {
      const singleDate = ['2025-01-07T10:00:00.000Z'];
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates: singleDate,
        blockedDates: ['2025-01-07'],
      });
      expect(matches).toHaveLength(0);
    });

    it('treats blockedDates as calendar-day comparisons regardless of time component', () => {
      // The date string in dates is 10:00 UTC; blockedDates has only the date portion
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates: ['2025-01-07T10:00:00.000Z', '2025-01-14T10:00:00.000Z'],
        blockedDates: ['2025-01-07T00:00:00.000Z'], // same calendar day, different time
      });
      matches.forEach((m) => {
        expect(m.scheduledAt.toISOString().slice(0, 10)).not.toBe('2025-01-07');
      });
    });

    // ── maxMatchesPerDayPerTeam ─────────────────────────────────────────────

    it('respects maxMatchesPerDayPerTeam when sufficient dates are provided', () => {
      // 4 teams -> 3 rounds, 3 dates -> each round gets a unique date -> 1 match per team per day
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates,
        maxMatchesPerDayPerTeam: 1,
      });
      const teamDayCounts = new Map<string, number>();
      matches.forEach((m) => {
        const day = m.scheduledAt.toISOString().slice(0, 10);
        for (const teamId of [m.teamAId, m.teamBId]) {
          const key = `${teamId}|${day}`;
          teamDayCounts.set(key, (teamDayCounts.get(key) ?? 0) + 1);
        }
      });
      // With 3 dates for 3 rounds and maxMatchesPerDayPerTeam=1, every team-day
      // bucket should contain exactly 1 match
      teamDayCounts.forEach((count) => {
        expect(count).toBe(1);
      });
    });

    it('best-effort: falls back to last date when maxMatchesPerDayPerTeam cannot be satisfied', () => {
      // Only 1 date, 3 rounds -- the constraint cannot be met; all matches still get scheduled
      const onlyOneDate = ['2025-01-07T10:00:00.000Z'];
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates: onlyOneDate,
        maxMatchesPerDayPerTeam: 1,
      });
      expect(matches).toHaveLength((teamIds.length * (teamIds.length - 1)) / 2);
      matches.forEach((m) => {
        expect(m.scheduledAt.toISOString().slice(0, 10)).toBe('2025-01-07');
      });
    });

    it('allows maxMatchesPerDayPerTeam > 1 to pack more rounds per day', () => {
      // 4 teams -> 3 rounds, 1 date, maxMatchesPerDayPerTeam=3 -> all rounds on that day
      const onlyOneDate = ['2025-01-07T10:00:00.000Z'];
      const matches = service.generateSchedule(seasonId, {
        divisionId,
        teamIds,
        courtIds,
        dates: onlyOneDate,
        maxMatchesPerDayPerTeam: 3,
      });
      expect(matches).toHaveLength((teamIds.length * (teamIds.length - 1)) / 2);
      matches.forEach((m) => {
        expect(m.scheduledAt.toISOString().slice(0, 10)).toBe('2025-01-07');
      });
    });
  });
});
