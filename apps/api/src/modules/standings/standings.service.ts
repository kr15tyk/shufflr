import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ResultStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface TeamStats {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsScored: number;
  pointsAllowed: number;
  pointDifferential: number;
  winPercentage: number;
}

export interface RankedTeamStats extends TeamStats {
  rank: number;
}

const nameCollator = new Intl.Collator('en', { sensitivity: 'base' });

/**
 * Pure function that sorts team stats by the deterministic tiebreaker chain:
 *   1. wins (desc)
 *   2. pointDifferential (desc)
 *   3. pointsScored (desc)
 *   4. teamName (asc, locale-insensitive, fixed locale)
 *   5. teamId (asc) — final stable tiebreaker when names are identical
 */
export function rankTeams(teams: TeamStats[]): RankedTeamStats[] {
  return [...teams]
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.pointDifferential !== a.pointDifferential)
        return b.pointDifferential - a.pointDifferential;
      if (b.pointsScored !== a.pointsScored) return b.pointsScored - a.pointsScored;
      const nameOrder = nameCollator.compare(a.teamName, b.teamName);
      if (nameOrder !== 0) return nameOrder;
      return a.teamId < b.teamId ? -1 : a.teamId > b.teamId ? 1 : 0;
    })
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

interface MatchApprovedPayload {
  matchId: string;
  seasonId: string;
  divisionId: string;
}

interface CacheEntry {
  data: RankedTeamStats[];
  expiresAt: number;
}

@Injectable()
export class StandingsService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('match.result.approved')
  handleMatchApproved(payload: MatchApprovedPayload): void {
    this.invalidateCache(payload.seasonId, payload.divisionId);
  }

  async getStandings(seasonId: string, divisionId?: string): Promise<RankedTeamStats[]> {
    // Normalize: treat blank/empty string the same as omitted
    const normalizedDivisionId = divisionId?.trim() || undefined;
    const cacheKey = `${seasonId}:${normalizedDivisionId ?? '*'}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      if (cached.expiresAt > Date.now()) {
        return cached.data;
      }
      // Remove stale entry on read to prevent unbounded Map growth
      this.cache.delete(cacheKey);
    }

    const matches = await this.prisma.match.findMany({
      where: {
        seasonId,
        ...(normalizedDivisionId ? { divisionId: normalizedDivisionId } : {}),
        result: { is: { status: ResultStatus.APPROVED } },
      },
      include: {
        result: true,
        teamA: true,
        teamB: true,
      },
    });

    const statsMap = new Map<string, TeamStats>();

    for (const match of matches) {
      if (!match.result) continue;

      const { scoreA, scoreB } = match.result;

      if (!statsMap.has(match.teamAId)) {
        statsMap.set(match.teamAId, {
          teamId: match.teamAId,
          teamName: match.teamA.name,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsScored: 0,
          pointsAllowed: 0,
          pointDifferential: 0,
          winPercentage: 0,
        });
      }

      if (!statsMap.has(match.teamBId)) {
        statsMap.set(match.teamBId, {
          teamId: match.teamBId,
          teamName: match.teamB.name,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsScored: 0,
          pointsAllowed: 0,
          pointDifferential: 0,
          winPercentage: 0,
        });
      }

      const teamA = statsMap.get(match.teamAId)!;
      const teamB = statsMap.get(match.teamBId)!;

      teamA.pointsScored += scoreA;
      teamA.pointsAllowed += scoreB;
      teamB.pointsScored += scoreB;
      teamB.pointsAllowed += scoreA;

      if (scoreA > scoreB) {
        teamA.wins++;
        teamB.losses++;
      } else if (scoreB > scoreA) {
        teamB.wins++;
        teamA.losses++;
      } else {
        teamA.ties++;
        teamB.ties++;
      }
    }

    for (const stats of statsMap.values()) {
      stats.pointDifferential = stats.pointsScored - stats.pointsAllowed;
      const totalGames = stats.wins + stats.losses + stats.ties;
      stats.winPercentage = totalGames > 0 ? stats.wins / totalGames : 0;
    }

    const ranked = rankTeams([...statsMap.values()]);

    this.cache.set(cacheKey, { data: ranked, expiresAt: Date.now() + this.CACHE_TTL_MS });

    return ranked;
  }

  private invalidateCache(seasonId: string, divisionId: string): void {
    this.cache.delete(`${seasonId}:${divisionId}`);
    this.cache.delete(`${seasonId}:*`);
  }
}
