import React, { createContext, useContext } from 'react';
import { useTenantTheme, TenantThemeState } from '../hooks/useTenantTheme';

const TenantContext = createContext<TenantThemeState>({
  loading: true,
  error: null,
  org: null,
  slug: null,
});

/** Provides the resolved org + theme state to all descendants. */
export function TenantProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const state = useTenantTheme();
  return <TenantContext.Provider value={state}>{children}</TenantContext.Provider>;
}

/** Returns the nearest TenantContext value. */
export function useTenant(): TenantThemeState {
  return useContext(TenantContext);
}
