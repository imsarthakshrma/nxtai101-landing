import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Validate JWT_SECRET at module initialization - fail fast if missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET must be set in environment variables');
}

export const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin_token';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'moderator';
    must_change_password?: boolean;
}

// JWT Payload validation schema
interface JWTPayload {
    id: string;
    email: string;
    name: string;
    role: string;
    iat?: number;
    exp?: number;
}

// Hash Password
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

// Verify Password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}


// Generate JWT Token
export function generateToken(user: AdminUser): string {
    return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }, JWT_SECRET, {
        expiresIn: '7d'
    })
}

// Validate JWT payload
function validateJWTPayload(payload: unknown): AdminUser | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const p = payload as Record<string, unknown>;

    // Validate required fields
    if (
        typeof p.id !== 'string' ||
        typeof p.email !== 'string' ||
        typeof p.name !== 'string' ||
        typeof p.role !== 'string'
    ) {
        return null;
    }

    // Validate role is one of the allowed values
    const validRoles: Array<AdminUser['role']> = ['super_admin', 'admin', 'moderator'];
    if (!validRoles.includes(p.role as AdminUser['role'])) {
        return null;
    }

    // Construct validated AdminUser object
    return {
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role as AdminUser['role'],
        must_change_password: typeof p.must_change_password === 'boolean' ? p.must_change_password : undefined,
    };
}

// Verify JWT Token
export function verifyToken(token: string): AdminUser | null {
    try {
        // Verify and decode token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Validate payload structure
        return validateJWTPayload(decoded);
    } catch {
        // Invalid token, expired, or verification failed
        return null;
    }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get auth cookie
export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// Clear Auth Cookie
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// Get current admin user from request
export async function getCurrentAdmin(): Promise<AdminUser | null> {
    const token = await getAuthCookie();
    if (!token) return null;
    return verifyToken(token);
}

// Middleware to protect admin routes
export async function requireAdmin(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Check if user has required role
export function hasRole(user: AdminUser, requiredRole: AdminUser['role']): boolean {
  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    moderator: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}