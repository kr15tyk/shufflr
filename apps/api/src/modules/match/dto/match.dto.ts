import { IsString, IsOptional } from 'class-validator';

export class GenerateScheduleDto {
  @IsString()
  seasonId!: string;

  @IsString()
  @IsOptional()
  format?: string;
}

export class EnterScoreDto {
  @IsString()
  homeScore!: string;

  @IsString()
  awayScore!: string;
}

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  courtId?: string;

  @IsString()
  @IsOptional()
  scheduledAt?: string;
}
