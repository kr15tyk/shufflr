import { IsString, IsOptional } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  teamId?: string;
}

export class UpdatePlayerDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  teamId?: string;
}
