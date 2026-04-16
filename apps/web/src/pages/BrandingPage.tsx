import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';
import { ThemeSettings, DEFAULT_THEME } from '../types/theme';
import { applyThemeToCss } from '../hooks/useTenantTheme';

interface FormState {
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  logoUrl: string;
  faviconUrl: string;
}

function toFormState(theme: ThemeSettings): FormState {
  return {
    primaryColor: theme.primaryColor ?? DEFAULT_THEME.primaryColor!,
    secondaryColor: theme.secondaryColor ?? DEFAULT_THEME.secondaryColor!,
    surfaceColor: theme.surfaceColor ?? DEFAULT_THEME.surfaceColor!,
    textColor: theme.textColor ?? DEFAULT_THEME.textColor!,
    fontHeading: theme.fontHeading ?? DEFAULT_THEME.fontHeading!,
    fontBody: theme.fontBody ?? DEFAULT_THEME.fontBody!,
    logoUrl: theme.logoUrl ?? '',
    faviconUrl: theme.faviconUrl ?? '',
  };
}

/**
 * Normalises a hex colour to 6-digit form.
 * Accepts `#RGB` → `#RRGGBB` or passes `#RRGGBB` through unchanged.
 * Returns null for anything that isn't a recognisable hex colour.
 */
function normalizeHexColor(value: string): string | null {
  const short = /^#([0-9a-fA-F]{3})$/.exec(value);
  if (short) {
    const [r, g, b] = short[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  return null;
}


function PreviewCard({ form }: { form: FormState }): React.JSX.Element {
  return (
    <div
      aria-label="Theme preview"
      style={{
        background: form.surfaceColor,
        color: form.textColor,
        fontFamily: form.fontBody,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: 400,
      }}
    >
      {/* Header strip */}
      <div
        style={{
          background: form.primaryColor,
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {form.logoUrl && (
          <img
            src={form.logoUrl}
            alt="Logo preview"
            style={{ height: 32, width: 'auto', borderRadius: 4 }}
          />
        )}
        <span
          style={{ color: '#fff', fontFamily: form.fontHeading, fontWeight: 700, fontSize: '1.1rem' }}
        >
          My Org
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem 1rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', opacity: 0.85 }}>
          This is how your branded app will appear to members.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              background: form.primaryColor,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.45rem 1rem',
              cursor: 'default',
              fontFamily: form.fontBody,
            }}
          >
            Primary
          </button>
          <button
            type="button"
            style={{
              background: form.secondaryColor,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.45rem 1rem',
              cursor: 'default',
              fontFamily: form.fontBody,
            }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
}

interface ColorFieldProps {
  label: string;
  fieldId: string;
  /** Must always be a valid 6-digit hex colour (e.g. `#4F46E5`). */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Color input that pairs a native color picker with a free-text hex input.
 *
 * The text input allows typing intermediate / 3-digit values without
 * disrupting the color picker.  Changes are committed to the parent (and the
 * picker updated) only when the text is a valid hex colour.
 */
function ColorField({ label, fieldId, value, onChange }: ColorFieldProps): React.JSX.Element {
  // `rawText` tracks what the user has typed so the text input doesn't jump
  // while they're mid-way through entering a value.
  const [rawText, setRawText] = useState(value);

  // Sync raw text when the parent resets the value (e.g. org loads async).
  useEffect(() => {
    setRawText(value);
  }, [value]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const text = e.target.value;
    setRawText(text);
    const normalized = normalizeHexColor(text);
    if (normalized) {
      onChange(normalized);
    }
  }

  function handleColorPickerChange(e: React.ChangeEvent<HTMLInputElement>): void {
    // The browser always emits a valid 6-digit hex from type="color".
    setRawText(e.target.value);
    onChange(e.target.value);
  }

  const pickerValue = normalizeHexColor(rawText) ?? value;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}
        htmlFor={fieldId}
      >
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          id={fieldId}
          type="color"
          value={pickerValue}
          onChange={handleColorPickerChange}
          style={{
            width: 40,
            height: 36,
            padding: 2,
            border: '1px solid #d1d5db',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={rawText}
          onChange={handleTextChange}
          placeholder="#000000"
          style={{
            width: 130,
            padding: '0.4rem 0.6rem',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            boxSizing: 'border-box',
          }}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

/**
 * Org-admin branding page.
 * A live preview card reflects changes as the admin types.
 * On save, PATCHes `/api/v1/organizations/:id/theme` and re-applies the CSS
 * variables globally so the current page updates immediately.
 */
export function BrandingPage(): React.JSX.Element {
  const { org, slug } = useTenant();
  const [form, setForm] = useState<FormState>(toFormState(org?.theme ?? DEFAULT_THEME));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track whether the user has made any manual edits so we don't overwrite
  // in-progress work when the org resolves asynchronously.
  const hasUserEdited = useRef(false);

  // When the tenant resolves after the initial render (async fetch), populate
  // the form with the stored theme – unless the user has already started editing.
  useEffect(() => {
    if (org && !hasUserEdited.current) {
      setForm(toFormState(org.theme));
    }
  }, [org]);

  function handleChange(field: keyof FormState, value: string): void {
    hasUserEdited.current = true;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Apply live preview to the actual page CSS vars.
      applyThemeToCss({
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        surfaceColor: updated.surfaceColor,
        textColor: updated.textColor,
        fontHeading: updated.fontHeading,
        fontBody: updated.fontBody,
        logoUrl: updated.logoUrl || null,
        faviconUrl: updated.faviconUrl || null,
      });
      return updated;
    });
    setSaveSuccess(false);
  }

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!org) return;

    // Tenant slug is required so the backend can validate the subdomain guard.
    // Fail with a user-visible message rather than sending an empty header that
    // would silently be rejected with 403.
    if (!slug) {
      setSaveError('Cannot save: tenant context is not available. Please reload the page.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const body: Record<string, string> = {
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
      };
      if (form.surfaceColor) body.surfaceColor = form.surfaceColor;
      if (form.textColor) body.textColor = form.textColor;
      if (form.fontHeading) body.fontHeading = form.fontHeading;
      if (form.fontBody) body.fontBody = form.fontBody;
      if (form.logoUrl) body.logoUrl = form.logoUrl;
      if (form.faviconUrl) body.faviconUrl = form.faviconUrl;

      const res = await fetch(`/api/v1/organizations/${org.organizationId}/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // The TenantMiddleware reads x-org-subdomain to set req.orgId.
          // Pass the subdomain slug so the guard can validate the request.
          'x-org-subdomain': slug,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
      }

      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--color-text, #111827)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading, sans-serif)',
          color: 'var(--color-primary, #4F46E5)',
          marginBottom: '0.25rem',
        }}
      >
        Org Branding
      </h1>
      {org && (
        <p style={{ margin: '0 0 2rem', color: 'var(--color-text, #111827)', opacity: 0.7 }}>
          Customise the look and feel for <strong>{org.name}</strong>.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Form ── */}
        <form onSubmit={handleSave} noValidate>
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem' }}>
            <legend style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Colours</legend>
            <ColorField
              label="Primary colour"
              fieldId="primaryColor"
              value={form.primaryColor}
              onChange={(v) => handleChange('primaryColor', v)}
            />
            <ColorField
              label="Secondary colour"
              fieldId="secondaryColor"
              value={form.secondaryColor}
              onChange={(v) => handleChange('secondaryColor', v)}
            />
            <ColorField
              label="Surface colour"
              fieldId="surfaceColor"
              value={form.surfaceColor}
              onChange={(v) => handleChange('surfaceColor', v)}
            />
            <ColorField
              label="Text colour"
              fieldId="textColor"
              value={form.textColor}
              onChange={(v) => handleChange('textColor', v)}
            />
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem' }}>
            <legend style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Typography</legend>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle} htmlFor="fontHeading">
                Heading font
              </label>
              <input
                id="fontHeading"
                type="text"
                value={form.fontHeading}
                onChange={(e) => handleChange('fontHeading', e.target.value)}
                placeholder="e.g. Inter, sans-serif"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle} htmlFor="fontBody">
                Body font
              </label>
              <input
                id="fontBody"
                type="text"
                value={form.fontBody}
                onChange={(e) => handleChange('fontBody', e.target.value)}
                placeholder="e.g. Inter, sans-serif"
                style={inputStyle}
              />
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem' }}>
            <legend style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Logo &amp; Favicon</legend>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle} htmlFor="logoUrl">
                Logo URL
              </label>
              <input
                id="logoUrl"
                type="url"
                value={form.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle} htmlFor="faviconUrl">
                Favicon URL
              </label>
              <input
                id="faviconUrl"
                type="url"
                value={form.faviconUrl}
                onChange={(e) => handleChange('faviconUrl', e.target.value)}
                placeholder="https://example.com/favicon.ico"
                style={inputStyle}
              />
            </div>
          </fieldset>

          {saveError && (
            <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Branding saved successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !org}
            style={{
              background: 'var(--color-primary, #4F46E5)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.6rem 1.5rem',
              fontWeight: 600,
              cursor: saving || !org ? 'not-allowed' : 'pointer',
              opacity: saving || !org ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save branding'}
          </button>
        </form>

        {/* ── Live Preview ── */}
        <div>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Live preview</p>
          <PreviewCard form={form} />
        </div>
      </div>
    </div>
  );
}
