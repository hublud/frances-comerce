/**
 * Admin Authentication Utilities for Francielle by Frances
 * Protected Admin Password: Reg4social@123#
 */

export const ADMIN_PASSWORD = 'Reg4social@123#';

const AUTH_STORAGE_KEY = 'fancielle_admin_authed_v1';

export function checkAdminPassword(inputPassword: string): boolean {
  if (!inputPassword) return false;
  const clean = inputPassword.trim();
  const validPasswords: string[] = [
    'Reg4social@123#',
    'Reg4social@123',
    ADMIN_PASSWORD,
  ];

  if (process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    validPasswords.push(process.env.NEXT_PUBLIC_ADMIN_PASSWORD.trim());
  }

  return validPasswords.includes(clean);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Check sessionStorage (current session)
    const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionAuth === 'true') return true;

    // Check localStorage (persistent remember me)
    const localAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localAuth === 'true') return true;
  } catch (e) {
    console.error('Error reading auth state:', e);
  }

  return false;
}

export function setAdminAuthenticated(remember = true): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    }
  } catch (e) {
    console.error('Error saving auth state:', e);
  }
}

export function clearAdminAuthentication(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing auth state:', e);
  }
}

