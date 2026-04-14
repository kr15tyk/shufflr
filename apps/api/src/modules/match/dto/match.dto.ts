import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class GenerateScheduleDto {
  @IsString()
  seasonId!: string;

  @IsString()
  @IsOptional()
  format?: string;
}

export class GenerateScheduleBodyDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  teamIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courtIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  dates!: string[];
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
  courtId?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
