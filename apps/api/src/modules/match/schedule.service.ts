import { Injectable } from '@nestjs/common';
import { GenerateScheduleBodyDto } from './dto/match.dto';

export interface ScheduledMatch {
  seasonId: string;
  divisionId: string;
  teamAId: string;
  teamBId: string;
  courtId: string;
  scheduledAt: Date;
  status: 'SCHEDULED';
}

type Pairing = [string, string | null];
type AssignedMatch = { teamA: string; teamB: string; courtId: string };

@Injectable()
export class ScheduleService {
  /**
   * Generates all round-robin pairings using the circle/rotation algorithm.
   * Returns an array of rounds, each containing pairings of [teamA, teamB].
   * A null value in the second position indicates a BYE (odd number of teams).
   */
  generateRoundRobin(teamIds: string[]): Pairing[][] {
    const teams: (string | null)[] = [...teamIds];
    if (teams.length % 2 !== 0) {
      teams.push(null); // add BYE sentinel for odd number of teams
    }

    const n = teams.length;
    const rounds: Pairing[][] = [];

    for (let round = 0; round < n - 1; round++) {
      const pairings: Pairing[] = [];
      for (let i = 0; i < n / 2; i++) {
        const teamA = teams[i];
        const teamB = teams[n - 1 - i];
        if (teamA !== null && teamB !== null) {
          pairings.push([teamA, teamB]);
        } else if (teamA !== null) {
          pairings.push([teamA, null]);
        } else if (teamB !== null) {
          pairings.push([teamB, null]);
        }
      }
      rounds.push(pairings);

      // Rotate: keep teams[0] fixed, rotate the remaining elements clockwise
      const last = teams.splice(n - 1, 1)[0];
      teams.splice(1, 0, last);
    }

    return rounds;
  }

  /**
   * Assigns courts to matches in each round.
   * Courts are chosen randomly per round with a best-effort constraint to avoid
   * giving a team the same court in consecutive rounds.
   */
  assignCourts(rounds: Pairing[][], courtIds: string[]): AssignedMatch[][] {
    const lastCourtByTeam = new Map<string, string>();

    return rounds.map((round) => {
      const shuffled = this.shuffleArray([...courtIds]);
      const usedThisRound = new Set<string>();
      const result: AssignedMatch[] = [];

      for (const [teamA, teamB] of round) {
        if (teamB === null) {
          continue; // BYE – no court needed
        }

        const prevA = lastCourtByTeam.get(teamA);
        const prevB = lastCourtByTeam.get(teamB);

        // Priority 1: unused this round AND not the last court of either team
        // Priority 2: unused this round AND not the last court of teamA
        // Priority 3: unused this round AND not the last court of teamB
        // Priority 4: unused this round (any)
        // Priority 5: any court (fallback)
        const courtId =
          shuffled.find((c) => !usedThisRound.has(c) && c !== prevA && c !== prevB) ??
          shuffled.find((c) => !usedThisRound.has(c) && c !== prevA) ??
          shuffled.find((c) => !usedThisRound.has(c) && c !== prevB) ??
          shuffled.find((c) => !usedThisRound.has(c)) ??
          shuffled[0];

        usedThisRound.add(courtId);
        lastCourtByTeam.set(teamA, courtId);
        lastCourtByTeam.set(teamB, courtId);
        result.push({ teamA, teamB, courtId });
      }

      return result;
    });
  }

  /**
   * Generates a full round-robin schedule and returns an array of Match objects
   * ready to be inserted into the database.
   *
   * Supports optional constraints:
   * - blockedDates: date strings (YYYY-MM-DD or ISO) whose calendar day is excluded.
   * - maxMatchesPerDayPerTeam: best-effort limit on how many matches a team plays per day.
   */
  generateSchedule(seasonId: string, dto: GenerateScheduleBodyDto): ScheduledMatch[] {
    const { divisionId, teamIds, courtIds, dates, maxMatchesPerDayPerTeam = 1, blockedDates = [] } =
      dto;

    // Normalise blocked dates to YYYY-MM-DD strings for easy comparison
    const blockedDaySet = new Set(blockedDates.map((d) => this.toDateKey(d)));

    // Filter out any dates whose calendar day is blocked
    const availableDates = dates.filter((d) => !blockedDaySet.has(this.toDateKey(d)));

    if (availableDates.length === 0) {
      return [];
    }

    const rounds = this.generateRoundRobin(teamIds);
    const assignedRounds = this.assignCourts(rounds, courtIds);
    const matches: ScheduledMatch[] = [];

    // Track how many matches each team has scheduled on each calendar day.
    // Key format: `${teamId}|${YYYY-MM-DD}`
    const teamDayCount = new Map<string, number>();

    for (const round of assignedRounds) {
      // Find the earliest available date where every team in this round is still
      // under the maxMatchesPerDayPerTeam limit.
      const dateStr =
        availableDates.find((d) => {
          const dayKey = this.toDateKey(d);
          return round.every(({ teamA, teamB }) => {
            const countA = teamDayCount.get(`${teamA}|${dayKey}`) ?? 0;
            const countB = teamDayCount.get(`${teamB}|${dayKey}`) ?? 0;
            return countA < maxMatchesPerDayPerTeam && countB < maxMatchesPerDayPerTeam;
          });
        }) ?? availableDates[availableDates.length - 1]; // best-effort fallback

      const dayKey = this.toDateKey(dateStr);
      const scheduledAt = new Date(dateStr);

      for (const { teamA, teamB, courtId } of round) {
        const keyA = `${teamA}|${dayKey}`;
        const keyB = `${teamB}|${dayKey}`;
        teamDayCount.set(keyA, (teamDayCount.get(keyA) ?? 0) + 1);
        teamDayCount.set(keyB, (teamDayCount.get(keyB) ?? 0) + 1);
        matches.push({
          seasonId,
          divisionId,
          teamAId: teamA,
          teamBId: teamB,
          courtId,
          scheduledAt: new Date(scheduledAt),
          status: 'SCHEDULED',
        });
      }
    }

    return matches;
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Returns the client-provided YYYY-MM-DD calendar day from a date string or ISO timestamp. */
  private toDateKey(d: string): string {
    const directDateMatch = d.match(/^(\d{4}-\d{2}-\d{2})(?:$|T|\s)/);
    if (directDateMatch) {
      return directDateMatch[1];
    }
    return new Date(d).toISOString().slice(0, 10);
  }
}

