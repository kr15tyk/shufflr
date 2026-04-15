import {
    IsString,
    IsOptional,
    IsInt,
    IsDateString,
    IsArray,
    ArrayMinSize,
    ArrayUnique,
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