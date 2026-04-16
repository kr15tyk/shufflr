import { IsString, IsOptional, Matches, ValidateIf } from 'class-validator';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export class UpdateThemeSettingsDto {
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  // Use ValidateIf instead of @IsOptional so that an explicit null is still
  // validated (and rejected by @IsString), while undefined skips validation.
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'primaryColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  primaryColor?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'secondaryColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  secondaryColor?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'surfaceColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  surfaceColor?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'textColor must be a valid hex color (e.g. #FFF or #FFFFFF)',
  })
  textColor?: string;

  @IsString()
  @IsOptional()
  fontHeading?: string;

  @IsString()
  @IsOptional()
  fontBody?: string;
}
