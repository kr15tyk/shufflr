import { useEffect, useState } from 'react';
import { OrgResolution, ThemeSettings, DEFAULT_THEME } from '../types/theme';

/**
 * Extracts the org slug from the current browser location.
 *
 * Resolution order:
 *  1. Subdomain: `<slug>.example.com` – first label of the hostname when it
 *     is not "www" or "localhost" and the hostname has more than one label.
 *  2. Path prefix: `example.com/org/<slug>` – first path segment after `/org/`.
 *
 * Returns `null` when no slug can be found (e.g. bare localhost dev server).
 */
export function resolveSlugFromLocation(location: Pick<Location, 'hostname' | 'pathname'>): string | null {
  const { hostname, pathname } = location;
  const labels = hostname.split('.');

  // Subdomain check: must have at least 2 labels and not be "www" or "localhost"
  if (labels.length >= 2 && labels[0] !== 'www' && labels[0] !== 'localhost') {
    return labels[0];
  }

  // Path-based fallback: /org/<slug>
  const match = /^\/org\/([^/]+)/.exec(pathname);
  if (match) {
    return match[1];
  }

  return null;
}

/** Merges API theme with defaults so callers always get a fully-typed object. */
function mergeWithDefaults(theme: ThemeSettings): Required<ThemeSettings> {
  return {
    logoUrl: theme.logoUrl ?? DEFAULT_THEME.logoUrl,
    faviconUrl: theme.faviconUrl ?? DEFAULT_THEME.faviconUrl,
    primaryColor: theme.primaryColor ?? DEFAULT_THEME.primaryColor!,
    secondaryColor: theme.secondaryColor ?? DEFAULT_THEME.secondaryColor!,
    surfaceColor: theme.surfaceColor ?? DEFAULT_THEME.surfaceColor!,
    textColor: theme.textColor ?? DEFAULT_THEME.textColor!,
    fontHeading: theme.fontHeading ?? DEFAULT_THEME.fontHeading!,
    fontBody: theme.fontBody ?? DEFAULT_THEME.fontBody!,
  };
}

/** Applies a theme object to CSS custom properties on :root. */
export function applyThemeToCss(theme: ThemeSettings): void {
  const root = document.documentElement;
  const merged = mergeWithDefaults(theme);

  root.style.setProperty('--color-primary', merged.primaryColor);
  root.style.setProperty('--color-secondary', merged.secondaryColor);
  root.style.setProperty('--color-surface', merged.surfaceColor);
  root.style.setProperty('--color-text', merged.textColor);
  root.style.setProperty('--font-heading', merged.fontHeading);
  root.style.setProperty('--font-body', merged.fontBody);
}

/** Updates the <link rel="icon"> favicon in <head>. */
function applyFavicon(faviconUrl: string | null): void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const url = faviconUrl ?? '/vite.svg';

  if (existing) {
    existing.href = url;
  } else {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  }
}

export interface TenantThemeState {
  loading: boolean;
  error: string | null;
  org: OrgResolution | null;
  slug: string | null;
}

/**
 * Detects the current tenant from the browser URL, fetches the org's theme via
 * `GET /api/v1/organizations/resolve?slug=<slug>`, and applies it as CSS custom
 * properties on `:root`. Also sets the favicon.
 *
 * Returns the resolved org data and loading/error state for consumers.
 */
export function useTenantTheme(): TenantThemeState {
  const [state, setState] = useState<TenantThemeState>({
    loading: true,
    error: null,
    org: null,
    slug: null,
  });

  // The empty dependency array is intentional: tenant resolution happens once
  // on page load. The org slug is derived from the initial URL; SPA navigation
  // within the same org does not change the tenant, so re-running on every
  // render would be redundant.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const slug = resolveSlugFromLocation(window.location);

    if (!slug) {
      // No slug found – apply defaults and skip API call.
      applyThemeToCss(DEFAULT_THEME);
      setState({ loading: false, error: null, org: null, slug: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, slug }));

    fetch(`/api/v1/organizations/resolve?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json() as Promise<OrgResolution>;
      })
      .then((org) => {
        applyThemeToCss(org.theme);
        applyFavicon(org.theme.faviconUrl);
        setState({ loading: false, error: null, org, slug });
      })
      .catch((err: unknown) => {
        // Fall back to defaults so the UI still renders.
        applyThemeToCss(DEFAULT_THEME);
        setState({
          loading: false,
          error: err instanceof Error ? err.message : String(err),
          org: null,
          slug,
        });
      });
  }, []);

  return state;
}
