import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
export const DEFAULT_JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const DEFAULT_REFRESH_TOKEN_DAYS = 7;
export const DEFAULT_RESET_TOKEN_HOURS = 1;

export interface TokenUserPayload {
  userId: string;
  email: string;
  tenantId?: string | null;
  campusId?: string | null;
  roleId?: string | null;
  [key: string]: any;
}

export class TokenHelper {
  /**
   * Generates a signed JWT Access Token with userId, email, and active tenant/campus context
   */
  static generateAccessToken(
    payload: TokenUserPayload,
    expiresIn: string = DEFAULT_JWT_EXPIRES_IN,
  ): { accessToken: string; expiresIn: string } {
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      sub: payload.userId,
      ...(payload.tenantId ? { tenantId: payload.tenantId } : {}),
      ...(payload.campusId ? { campusId: payload.campusId } : {}),
      ...(payload.roleId ? { roleId: payload.roleId } : {}),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });

    return { accessToken: token, expiresIn };
  }

  /**
   * Verifies and decodes a JWT Access Token
   */
  static verifyAccessToken<T = TokenUserPayload>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
  }

  /**
   * Hashes a raw token string using SHA-256 (deterministic, safe for DB indexing)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a cryptographically secure random token string
   */
  static generateRandomToken(byteLength: number = 32): string {
    return crypto.randomBytes(byteLength).toString('hex');
  }

  /**
   * Computes refresh token expiry Date (default: 7 days)
   */
  static getRefreshTokenExpiry(days: number = DEFAULT_REFRESH_TOKEN_DAYS): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Computes password reset token expiry Date (default: 1 hour)
   */
  static getResetTokenExpiry(hours: number = DEFAULT_RESET_TOKEN_HOURS): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}

export default TokenHelper;
