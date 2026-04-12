import { IsString, IsOptional } from 'class-validator';

export class CreateCourtDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateCourtDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
