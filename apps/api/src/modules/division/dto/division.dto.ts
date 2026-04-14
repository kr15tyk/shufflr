import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';

export enum DivisionFormat {
  TEAMS = 'TEAMS',
  SINGLES = 'SINGLES',
}

export class CreateDivisionDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsEnum(DivisionFormat)
  format!: DivisionFormat;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxTeams?: number;
}

export class UpdateDivisionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(DivisionFormat)
  @IsOptional()
  format?: DivisionFormat;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxTeams?: number;
}
