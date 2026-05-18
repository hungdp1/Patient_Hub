import dotenv from 'dotenv';
dotenv.config();

import prisma from './src/lib/prismaClient';
import { comparePassword } from './src/utils/password';

async function main() {
  const emails = [
    'admin@patienthub.local',
    'doctor1@patienthub.local',
    'doctor2@patienthub.local',
    'technician@patienthub.local',
    'patient@patienthub.local',
    'patient2@patienthub.local',
  ];

  const passwordToTest = process.env.UNIFIED_PASSWORD || 'Password@123';
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`${email}: NOT FOUND`);
      continue;
    }
    const ok = await comparePassword(passwordToTest, user.passwordHash);
    console.log(`${email}: ${ok ? 'OK' : 'INVALID'}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
