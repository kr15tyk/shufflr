import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResultSource, ResultStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  ApproveScoreDto,
  EnterScoreDto,
  RejectScoreDto,
  SubmitScoreDto,
  UpdateMatchDto,
} from './dto/match.dto';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
}

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {}

  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  enterScore(id: string, _dto: EnterScoreDto) {
    return { id };
  }

  update(id: string, _dto: UpdateMatchDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }

  async submitScore(matchId: string, dto: SubmitScoreDto, user: AuthenticatedUser) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        result: true,
        teamA: { include: { players: true } },
        teamB: { include: { players: true } },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const isAdmin =
      user.roles.includes('ORG_ADMIN') ||
      user.roles.includes('LEAGUE_ADMIN') ||
      user.roles.includes('SUPER_ADMIN');

    const allPlayers = [...match.teamA.players, ...match.teamB.players];
    const isParticipant = allPlayers.some((p) => p.userId === user.userId);
    if (!isParticipant) {
      throw new ForbiddenException('You can only submit scores for matches you participate in');
    }

    // Once APPROVED, block further player submissions (admin override path only)
    if (match.result?.status === ResultStatus.APPROVED && !isAdmin) {
      throw new ConflictException('Score has already been approved; only an admin can override');
    }

    const source = isAdmin ? ResultSource.ADMIN : ResultSource.PLAYER;

    // Prevent duplicate PENDING submissions atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.matchResult.findUnique({ where: { matchId } });
      if (current?.status === ResultStatus.PENDING) {
        throw new ConflictException('A pending score submission already exists for this match');
      }

      return tx.matchResult.upsert({
        where: { matchId },
        create: {
          matchId,
          scoreA: dto.scoreA,
          scoreB: dto.scoreB,
          status: ResultStatus.PENDING,
          source,
          submittedById: user.userId,
        },
        update: {
          scoreA: dto.scoreA,
          scoreB: dto.scoreB,
          status: ResultStatus.PENDING,
          source,
          submittedById: user.userId,
          rejectionReason: null,
        },
      });
    });

    // Notify for review (best-effort; NotificationService is a stub)
    this.notificationService.sendNotification({
      recipientId: user.userId,
      message: `Score submitted for match ${matchId} — awaiting admin approval`,
    });

    return result;
  }

  async approveScore(matchId: string, dto: ApproveScoreDto, user: AuthenticatedUser) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { result: true },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (!match.result) {
      throw new BadRequestException('No score submission found for this match');
    }

    if (match.result.status === ResultStatus.APPROVED) {
      throw new ConflictException('Score has already been approved');
    }

    const isOverriding = dto.scoreA != null || dto.scoreB != null;
    const scoreA = dto.scoreA ?? match.result.scoreA;
    const scoreB = dto.scoreB ?? match.result.scoreB;

    const result = await this.prisma.matchResult.update({
      where: { matchId },
      data: {
        scoreA,
        scoreB,
        status: ResultStatus.APPROVED,
        source: isOverriding ? ResultSource.ADMIN : match.result.source,
        approvedById: user.userId,
        rejectionReason: null,
      },
    });

    this.eventEmitter.emit('match.result.approved', {
      matchId,
      divisionId: match.divisionId,
      status: result.status,
      source: result.source,
      scoreA: result.scoreA,
      scoreB: result.scoreB,
      approvedById: user.userId,
    });

    return result;
  }

  async rejectScore(matchId: string, dto: RejectScoreDto, _user: AuthenticatedUser) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { result: true },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (!match.result) {
      throw new BadRequestException('No score submission found for this match');
    }

    if (match.result.status === ResultStatus.APPROVED) {
      throw new ConflictException('Cannot reject an already-approved score');
    }

    const result = await this.prisma.matchResult.update({
      where: { matchId },
      data: {
        status: ResultStatus.REJECTED,
        approvedById: null,
        rejectionReason: dto.rejectionReason ?? null,
      },
    });

    return result;
  }
}

