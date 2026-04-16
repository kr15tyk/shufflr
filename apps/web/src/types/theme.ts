export interface ThemeSettings {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  surfaceColor: string | null;
  textColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
}

export interface OrgResolution {
  organizationId: string;
  name: string;
  theme: ThemeSettings;
}

export const DEFAULT_THEME: ThemeSettings = {
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#4F46E5',
  secondaryColor: '#7C3AED',
  surfaceColor: '#ffffff',
  textColor: '#111827',
  fontHeading: 'sans-serif',
  fontBody: 'sans-serif',
};
