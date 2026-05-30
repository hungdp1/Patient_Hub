/**
 * Reusable Prisma `select` shapes that intentionally OMIT secrets.
 *
 * The most important rule here: NEVER include `passwordHash`. Returning the
 * bcrypt hash to the browser is a leak — bcrypt is slow but not infinite,
 * and we don't want any attacker who skims a network response to have weeks
 * to crack it offline.
 *
 * Use these whenever you `include` a `User` (directly or via Doctor / Patient
 * / Technician / Staff). If you find yourself writing a new `include: { user:
 * true }`, replace it with `include: { user: { select: publicUserSelect } }`.
 */

export const publicUserSelect = {
  id: true,
  email: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  city: true,
  country: true,
  profilePicture: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  // ❌ passwordHash, isLocked, failedLoginAttempts, lastLoginAt,
  //    passwordChangedAt are NOT exposed.
} as const;

/** Doctor with public user info attached — safe to return to any role. */
export const doctorPublicInclude = {
  user: { select: publicUserSelect },
} as const;

/** Technician with public user info attached. */
export const technicianPublicInclude = {
  user: { select: publicUserSelect },
} as const;

/** Patient with public user info attached. */
export const patientPublicInclude = {
  user: { select: publicUserSelect },
} as const;
