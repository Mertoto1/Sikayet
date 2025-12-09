import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { prisma } from './db';

// Generate a secret for 2FA
export function generate2FASecret(email: string): string {
  const secret = authenticator.generateSecret();
  return secret;
}

// Generate QR code URL for authenticator apps
export function generateQRCodeURL(secret: string, email: string, appName: string = 'Sikayetbet'): string {
  const encodedAppName = encodeURIComponent(appName);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedAppName}:${encodedEmail}?secret=${secret}&issuer=${encodedAppName}`;
}

// Generate QR code as data URL
export async function generateQRCodeDataURL(secret: string, email: string, appName: string = 'Sikayetbet'): Promise<string> {
  const otpAuthUrl = generateQRCodeURL(secret, email, appName);
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

// Verify 2FA token
export function verify2FAToken(secret: string, token: string): boolean {
  try {
    return authenticator.check(token, secret);
  } catch (error) {
    return false;
  }
}

// Enable 2FA for a user
export async function enable2FA(userId: number, secret: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });
}

// Disable 2FA for a user
export async function disable2FA(userId: number) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
}

// Check if user has 2FA enabled
export async function is2FAEnabled(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });
  
  return user?.twoFactorEnabled || false;
}

// Get user's 2FA secret
export async function getUser2FASecret(userId: number): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true },
  });
  
  return user?.twoFactorSecret || null;
}