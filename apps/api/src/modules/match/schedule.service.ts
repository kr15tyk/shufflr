import { Injectable } from '@nestjs/common';
import { GenerateScheduleBodyDto } from './dto/match.dto';

export interface ScheduledMatch {
  seasonId: string;
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

        // Prefer: unused this round AND not the last court of either team
        const courtId =
          shuffled.find(
            (c) => !usedThisRound.has(c) && c !== prevA && c !== prevB,
          ) ??
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
   */
  generateSchedule(
    seasonId: string,
    dto: GenerateScheduleBodyDto,
  ): ScheduledMatch[] {
    const { teamIds, courtIds, dates } = dto;

    const rounds = this.generateRoundRobin(teamIds);
    const assignedRounds = this.assignCourts(rounds, courtIds);

    const matches: ScheduledMatch[] = [];

    assignedRounds.forEach((round, roundIndex) => {
      // If there are fewer dates than rounds, reuse the last available date
      const scheduledAt = new Date(
        dates[roundIndex] ?? dates[dates.length - 1],
      );

      for (const { teamA, teamB, courtId } of round) {
        matches.push({
          seasonId,
          teamAId: teamA,
          teamBId: teamB,
          courtId,
          scheduledAt,
          status: 'SCHEDULED',
        });
      }
    });

    return matches;
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
