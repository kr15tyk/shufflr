import { IsString, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name!: string;

  @IsString()
  divisionId!: string;

  @IsString()
  @IsOptional()
  leagueId?: string;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  divisionId?: string;

  @IsString()
  @IsOptional()
  leagueId?: string;
}
