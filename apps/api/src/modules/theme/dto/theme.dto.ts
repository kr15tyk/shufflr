import { IsString, IsOptional, Matches } from 'class-validator';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export class UpdateThemeSettingsDto {
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'primaryColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'secondaryColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'surfaceColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  @IsOptional()
  surfaceColor?: string;

  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'textColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  @IsOptional()
  textColor?: string;

  @IsString()
  @IsOptional()
  fontHeading?: string;

  @IsString()
  @IsOptional()
  fontBody?: string;
}
