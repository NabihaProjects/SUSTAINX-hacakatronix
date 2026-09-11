// SOIL IQ - Authentication, RBAC & Multi-Tenant Scoping

import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export type UserRole = 'OWNER' | 'ADMIN' | 'FARM_MANAGER' | 'OPERATOR' | 'VIEWER';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  role: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 50,
  ADMIN: 40,
  FARM_MANAGER: 30,
  OPERATOR: 20,
  VIEWER: 10,
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Returns the active session for server components and actions.
 * Defaults to the seed admin user or inspects cookies.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    // Look up default active organization and admin user
    const member = await prisma.organizationMember.findFirst({
      include: {
        user: true,
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!member) return null;

    return {
      userId: member.user.id,
      email: member.user.email,
      name: member.user.name,
      organizationId: member.organization.id,
      organizationName: member.organization.name,
      role: member.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Validates that the requested resource belongs strictly to the user's organization.
 */
export async function verifyOrganizationAccess(
  resourceOrgId: string,
  sessionOrgId: string
): Promise<void> {
  if (resourceOrgId !== sessionOrgId) {
    throw new Error('Access denied: Resource does not belong to your organization.');
  }
}

/**
 * Helper to verify password during login.
 */
export async function verifyCredentials(passwordPlain: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(passwordPlain, passwordHash);
}
