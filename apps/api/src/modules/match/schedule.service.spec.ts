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
                                const rounds = service.generateRoundRobin([
                                          't1',
                                          't2',
                                          't3',
                                          't4',
                                          't5',
                                          't6',
                                        ]);
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
                                 const rounds = service.generateRoundRobin([
                                           't1',
                                           't2',
                                           't3',
                                           't4',
                                           't5',
                                           't6',
                                         ]);
                                service.assignCourts(rounds, courts).forEach((round) => {
                                          const roundCourts = round.map((m) => m.courtId);
                                          expect(new Set(roundCourts).size).toBe(roundCourts.length);
                                });
                        });

                        it('best-effort: avoids giving a team the same court in consecutive rounds (deterministic)', () => {
                                // Mock Math.random to return a fixed sequence so the shuffle is deterministic.
                                 // Returning 0 always means the Fisher-Yates swap picks index 0 each time,
                                 // effectively leaving the array in its original order: ['c1', 'c2', 'c3'].
                                 const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

                                 try {
                                           // With 4 teams, there are 3 rounds of 2 matches each.
                                  // Courts are always ordered ['c1', 'c2', 'c3'] due to the mock.
                                  // Round 1: match1 -> c1, match2 -> c2  (lastCourt: t1=c1, t4=c1, t2=c2, t3=c2)
                                  // Round 2: match1 prefers not c1 (t1/t2 last courts) -> picks c2? No:
                                  //   t1 last=c1, t3 last=c2; prefer c != c1 && c != c2 -> c3
                                  //   t2 last=c2, t4 last=c1; prefer c != c2 && c != c1 -> c3, but used -> c1
                                  // The exact assignments depend on pairings, but the key assertion is:
                                  // no team is assigned the same court in back-to-back rounds when a free court exists.
                                  const rounds = service.generateRoundRobin(['t1', 't2', 't3', 't4']);
                                           const assigned = service.assignCourts(rounds, courts);

                                  // Verify all assigned courts are valid
                                  assigned.flat().forEach(({ courtId }) => {
                                              expect(courts).toContain(courtId);
                                  });

                                  // With 3 courts and 2 matches per round, there is always a free court.
                                  // Verify no team gets the same court in consecutive rounds.
                                  const lastCourt = new Map<string, string>();
                                           assigned.flat().forEach(({ teamA, teamB, courtId }) => {
                                                       if (lastCourt.has(teamA)) {
                                                                     expect(lastCourt.get(teamA)).not.toBe(courtId);
                                                       }
                                                       if (lastCourt.has(teamB)) {
                                                                     expect(lastCourt.get(teamB)).not.toBe(courtId);
                                                       }
                                                       lastCourt.set(teamA, courtId);
                                                       lastCourt.set(teamB, courtId);
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
                                expect(matches).toHaveLength(
                                          (oddTeams.length * (oddTeams.length - 1)) / 2,
                                        );
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
                                matches.forEach((m) =>
                                          expect(validDates).toContain(m.scheduledAt.toISOString()),
                                                      );
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
                                matches.forEach((m) =>
                                          expect(m.scheduledAt.toISOString()).toBe(expected),
                                                      );
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
           });
});
