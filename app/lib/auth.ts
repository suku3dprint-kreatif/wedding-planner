import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'workspace_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Hash passcode
export async function hashPasscode(passcode: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passcode, salt);
}

// Verify passcode
export async function verifyPasscode(
  passcode: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(passcode, hash);
}

// Set workspace cookie
export async function setWorkspaceCookie(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, workspaceId, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

// Get workspace ID from cookie
export async function getWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// Clear workspace cookie
export async function clearWorkspaceCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Validate passcode format (6 digits)
export function isValidPasscodeFormat(passcode: string): boolean {
  return /^\d{6}$/.test(passcode);
}
