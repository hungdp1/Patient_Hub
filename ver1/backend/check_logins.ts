import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import prisma from './src/lib/prismaClient';
import { comparePassword, hashPassword } from './src/utils/password';

type RoleKey = 'ADMIN' | 'DOCTOR' | 'TECHNICIAN' | 'PATIENT' | string;

async function parsePasswordFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim());

  const mapping: Record<RoleKey, { phone?: string; password?: string }> = {};
  let currentRole: RoleKey | null = null;

  for (const line of lines) {
    if (!line) continue;
    // Role header lines are uppercase words like ADMIN, DOCTOR, PATIENT
    if (/^[A-Z][A-Z0-9_ ]+$/.test(line) && !line.includes(':')) {
      currentRole = line.split(/[\s]+/)[0];
      mapping[currentRole] = mapping[currentRole] || {};
      continue;
    }

    const phoneMatch = line.match(/Phone:\s*(\+?\d[\d\s-]*)/i);
    if (phoneMatch && currentRole) {
      mapping[currentRole].phone = phoneMatch[1].replace(/\s|-/g, '');
      continue;
    }

    const passMatch = line.match(/Password:\s*(\S+)/i);
    if (passMatch && currentRole) {
      mapping[currentRole].password = passMatch[1].trim();
      continue;
    }

    // Fallback: a bare password line (like Patient@123)
    if (!line.includes(':') && currentRole && /[A-Za-z0-9@#$%^&*()_+\-=.]{6,}/.test(line)) {
      mapping[currentRole].password = line.trim();
    }
  }

  return mapping;
}

async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pwdFile = path.resolve(__dirname, '..', 'Password.md');
    if (!fs.existsSync(pwdFile)) {
      console.error('Password.md not found at', pwdFile);
      process.exit(2);
    }

    const mapping = await parsePasswordFile(pwdFile);
    const rolesToCheck: RoleKey[] = ['ADMIN', 'DOCTOR', 'TECHNICIAN', 'PATIENT'];

    console.log('Parsed passwords for roles:', Object.keys(mapping));

    for (const roleKey of rolesToCheck) {
      const entry = mapping[roleKey];
      if (!entry) {
        console.warn(`No entry for role ${roleKey} in Password.md`);
        continue;
      }

      const phone = entry.phone;
      const desiredPassword = entry.password;

      if (!phone || !desiredPassword) {
        console.warn(`Skipping ${roleKey}: missing phone or password`);
        continue;
      }

      console.log(`\nChecking role ${roleKey} (phone ${phone})`);

      const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
      if (!user) {
        console.warn(`User with phone ${phone} not found. Attempting to find by email for common seed addresses.`);
        // fallback emails used in seed
        const emailFallbacks = {
          ADMIN: 'admin@patienthub.local',
          DOCTOR: 'doctor1@patienthub.local',
          TECHNICIAN: 'technician@patienthub.local',
          PATIENT: 'patient@patienthub.local',
        } as Record<RoleKey, string>;
        const email = emailFallbacks[roleKey] || '';
        if (email) {
          const u2 = await prisma.user.findUnique({ where: { email } });
          if (u2) {
            console.log(`Found user by email ${email}`);
          }
        }
        continue;
      }

      const ok = await comparePassword(desiredPassword, user.passwordHash);
      if (ok) {
        console.log(`✅ ${roleKey} login OK with provided password.`);
        // ensure account unlocked
        if (user.isLocked || user.failedLoginAttempts > 0 || !user.isActive) {
          await prisma.user.update({ where: { id: user.id }, data: { isLocked: false, failedLoginAttempts: 0, isActive: true } });
          console.log(`Normalized account flags for ${roleKey}.`);
        }
      } else {
        console.warn(`❌ ${roleKey} password mismatch. Updating DB to use provided password.`);
        const newHash = await hashPassword(desiredPassword);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, isLocked: false, failedLoginAttempts: 0, isActive: true } });
        console.log(`Updated passwordHash for user ${user.email} (phone ${user.phoneNumber}).`);
      }
    }

    console.log('\nAll checks complete. You should now be able to log in with the passwords from Password.md.');
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
