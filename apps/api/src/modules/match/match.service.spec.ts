import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResultSource, ResultStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuthenticatedUser, MatchService } from './match.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

const adminUser: AuthenticatedUser = {
  userId: 'admin-1',
  email: 'admin@example.com',
  roles: ['ORG_ADMIN'],
};

const playerUser: AuthenticatedUser = {
  userId: 'player-1',
  email: 'player@example.com',
  roles: ['PLAYER'],
};

const outsiderUser: AuthenticatedUser = {
  userId: 'outsider-99',
  email: 'outsider@example.com',
  roles: ['PLAYER'],
};

function buildMatch(overrides: Partial<{
  result: object | null;
  teamAPlayers: { userId: string }[];
  teamBPlayers: { userId: string }[];
}> = {}) {
  const {
    result = null,
    teamAPlayers = [{ userId: 'player-1' }],
    teamBPlayers = [{ userId: 'player-2' }],
  } = overrides;

  return {
    id: 'match-1',
    seasonId: 'season-1',
    divisionId: 'division-1',
    teamAId: 'team-a',
    teamBId: 'team-b',
    courtId: 'court-1',
    scheduledAt: new Date(),
    status: 'SCHEDULED',
    result,
    teamA: { players: teamAPlayers },
    teamB: { players: teamBPlayers },
  };
}

function buildResult(overrides: Record<string, unknown> = {}) {
  return {
    id: 'result-1',
    matchId: 'match-1',
    scoreA: 3,
    scoreB: 1,
    status: ResultStatus.PENDING,
    source: ResultSource.PLAYER,
    rejectionReason: null,
    submittedById: 'player-1',
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('MatchService', () => {
  let service: MatchService;
  let prismaMock: {
    match: { findUnique: jest.Mock };
    matchResult: { upsert: jest.Mock; update: jest.Mock };
  };
  let eventEmitterMock: { emit: jest.Mock };
  let notificationMock: { sendNotification: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      match: { findUnique: jest.fn() },
      matchResult: { upsert: jest.fn(), update: jest.fn() },
    };
    eventEmitterMock = { emit: jest.fn() };
    notificationMock = { sendNotification: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── submitScore ────────────────────────────────────────────────────────────

  describe('submitScore', () => {
    it('throws NotFoundException when match does not exist', async () => {
      prismaMock.match.findUnique.mockResolvedValue(null);

      await expect(
        service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when player is not a participant', async () => {
      prismaMock.match.findUnique.mockResolvedValue(buildMatch());

      await expect(
        service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, outsiderUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows a participant player to submit a score', async () => {
      const pending = buildResult();
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: null }));
      prismaMock.matchResult.upsert.mockResolvedValue(pending);

      const result = await service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser);

      expect(result.status).toBe(ResultStatus.PENDING);
      expect(result.source).toBe(ResultSource.PLAYER);
    });

    it('throws ConflictException on duplicate PENDING submission', async () => {
      const existing = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: existing }));

      await expect(
        service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser),
      ).rejects.toThrow(ConflictException);
    });

    it('blocks a player from submitting when score is APPROVED', async () => {
      const approved = buildResult({ status: ResultStatus.APPROVED });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: approved }));

      await expect(
        service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser),
      ).rejects.toThrow(ConflictException);
    });

    it('allows admin to submit even when a score is APPROVED (override path)', async () => {
      const approved = buildResult({ status: ResultStatus.APPROVED });
      prismaMock.match.findUnique.mockResolvedValue(
        buildMatch({ result: approved, teamAPlayers: [], teamBPlayers: [] }),
      );
      const pending = buildResult({ status: ResultStatus.PENDING, source: ResultSource.PLAYER });
      prismaMock.matchResult.upsert.mockResolvedValue(pending);

      const result = await service.submitScore('match-1', { scoreA: 5, scoreB: 0 }, adminUser);
      expect(result.status).toBe(ResultStatus.PENDING);
    });

    it('sends a notification after successful submission', async () => {
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: null }));
      prismaMock.matchResult.upsert.mockResolvedValue(buildResult());

      await service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser);

      expect(notificationMock.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ recipientId: playerUser.userId }),
      );
    });

    it('sets source to PLAYER when submitted by a player', async () => {
      const pending = buildResult({ source: ResultSource.PLAYER });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: null }));
      prismaMock.matchResult.upsert.mockResolvedValue(pending);

      const result = await service.submitScore('match-1', { scoreA: 3, scoreB: 1 }, playerUser);
      expect(result.source).toBe(ResultSource.PLAYER);
    });
  });

  // ── approveScore ──────────────────────────────────────────────────────────

  describe('approveScore', () => {
    it('throws NotFoundException when match does not exist', async () => {
      prismaMock.match.findUnique.mockResolvedValue(null);

      await expect(
        service.approveScore('match-1', {}, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when no result exists', async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        ...buildMatch(),
        result: null,
        divisionId: 'div-1',
      });

      await expect(
        service.approveScore('match-1', {}, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when score is already APPROVED', async () => {
      const approved = buildResult({ status: ResultStatus.APPROVED });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: approved }));

      await expect(
        service.approveScore('match-1', {}, adminUser),
      ).rejects.toThrow(ConflictException);
    });

    it('transitions status from PENDING to APPROVED', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const approved = buildResult({ status: ResultStatus.APPROVED, approvedById: adminUser.userId });
      prismaMock.matchResult.update.mockResolvedValue(approved);

      const result = await service.approveScore('match-1', {}, adminUser);

      expect(result.status).toBe(ResultStatus.APPROVED);
    });

    it('keeps source as PLAYER when admin approves without score override', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING, source: ResultSource.PLAYER });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const approved = buildResult({
        status: ResultStatus.APPROVED,
        source: ResultSource.PLAYER,
        approvedById: adminUser.userId,
      });
      prismaMock.matchResult.update.mockResolvedValue(approved);

      const result = await service.approveScore('match-1', {}, adminUser);

      expect(result.source).toBe(ResultSource.PLAYER);
    });

    it('sets source to ADMIN when admin overrides scores', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING, source: ResultSource.PLAYER });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const overridden = buildResult({
        status: ResultStatus.APPROVED,
        source: ResultSource.ADMIN,
        scoreA: 5,
        scoreB: 0,
        approvedById: adminUser.userId,
      });
      prismaMock.matchResult.update.mockResolvedValue(overridden);

      const result = await service.approveScore('match-1', { scoreA: 5, scoreB: 0 }, adminUser);

      expect(result.source).toBe(ResultSource.ADMIN);
    });

    it('emits match.result.approved event after approval', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const approved = buildResult({
        status: ResultStatus.APPROVED,
        source: ResultSource.PLAYER,
        approvedById: adminUser.userId,
      });
      prismaMock.matchResult.update.mockResolvedValue(approved);

      await service.approveScore('match-1', {}, adminUser);

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'match.result.approved',
        expect.objectContaining({
          matchId: 'match-1',
          divisionId: 'division-1',
          status: ResultStatus.APPROVED,
          source: ResultSource.PLAYER,
        }),
      );
    });
  });

  // ── rejectScore ───────────────────────────────────────────────────────────

  describe('rejectScore', () => {
    it('throws NotFoundException when match does not exist', async () => {
      prismaMock.match.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectScore('match-1', {}, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when no result exists', async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        ...buildMatch(),
        result: null,
        divisionId: 'div-1',
      });

      await expect(
        service.rejectScore('match-1', {}, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when score is already APPROVED', async () => {
      const approved = buildResult({ status: ResultStatus.APPROVED });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: approved }));

      await expect(
        service.rejectScore('match-1', {}, adminUser),
      ).rejects.toThrow(ConflictException);
    });

    it('transitions status from PENDING to REJECTED', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const rejected = buildResult({ status: ResultStatus.REJECTED, approvedById: adminUser.userId });
      prismaMock.matchResult.update.mockResolvedValue(rejected);

      const result = await service.rejectScore('match-1', {}, adminUser);

      expect(result.status).toBe(ResultStatus.REJECTED);
    });

    it('saves rejectionReason when provided', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const rejected = buildResult({
        status: ResultStatus.REJECTED,
        approvedById: adminUser.userId,
        rejectionReason: 'Scores do not match official records',
      });
      prismaMock.matchResult.update.mockResolvedValue(rejected);

      const result = await service.rejectScore(
        'match-1',
        { rejectionReason: 'Scores do not match official records' },
        adminUser,
      );

      expect(result.rejectionReason).toBe('Scores do not match official records');
    });

    it('sets rejectionReason to null when not provided', async () => {
      const pending = buildResult({ status: ResultStatus.PENDING });
      prismaMock.match.findUnique.mockResolvedValue(buildMatch({ result: pending }));
      const rejected = buildResult({
        status: ResultStatus.REJECTED,
        approvedById: adminUser.userId,
        rejectionReason: null,
      });
      prismaMock.matchResult.update.mockResolvedValue(rejected);

      const result = await service.rejectScore('match-1', {}, adminUser);

      expect(result.rejectionReason).toBeNull();
    });
  });
});
