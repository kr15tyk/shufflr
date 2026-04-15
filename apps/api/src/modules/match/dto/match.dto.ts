import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  Min,
  Matches,
} from 'class-validator';

export class GenerateScheduleDto {
  @IsString()
  seasonId!: string;

  @IsString()
  divisionId!: string;

  @IsString()
  @IsOptional()
  format?: string;
}

export class GenerateScheduleBodyDto {
  @IsString()
  divisionId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsString({ each: true })
  teamIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  courtIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  dates!: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  maxMatchesPerDayPerTeam?: number;

  /**
   * Optional list of calendar days to skip when scheduling.
   * Accepts YYYY-MM-DD plain dates as well as full ISO 8601 datetime strings,
   * both starting with the YYYY-MM-DD prefix. Using @Matches rather than
   * @IsDateString here because @IsDateString requires a time component in some
   * validator configurations and would reject plain date-only strings.
   */
  @IsArray()
  @IsString({ each: true })
  @Matches(/^\d{4}-\d{2}-\d{2}/, { each: true })
  @IsOptional()
  blockedDates?: string[];
}

/**
 * Body DTO for POST /divisions/:id/generate-schedule.
 * The divisionId comes from the URL param, so seasonId is supplied in the body instead.
 */
export class DivisionScheduleBodyDto {
  @IsString()
  seasonId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsString({ each: true })
  teamIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  courtIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsDateString({}, { each: true })
  dates!: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  maxMatchesPerDayPerTeam?: number;

  /**
   * Optional list of calendar days to skip when scheduling.
   * Accepts YYYY-MM-DD plain dates as well as full ISO 8601 datetime strings,
   * both starting with the YYYY-MM-DD prefix. Using @Matches rather than
   * @IsDateString here because @IsDateString requires a time component in some
   * validator configurations and would reject plain date-only strings.
   */
  @IsArray()
  @IsString({ each: true })
  @Matches(/^\d{4}-\d{2}-\d{2}/, { each: true })
  @IsOptional()
  blockedDates?: string[];
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
