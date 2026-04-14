import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class GenerateScheduleDto {
  @IsString()
  seasonId!: string;

  @IsString()
  divisionId!: string;

  @IsString()
  @IsOptional()
  format?: string;
}

export class EnterScoreDto {
  @IsInt()
  homeScore!: number;

  @IsInt()
  awayScore!: number;
}

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  divisionId?: string;

  @IsString()
  @IsOptional()
  courtId?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
