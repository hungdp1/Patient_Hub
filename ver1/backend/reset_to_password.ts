import dotenv from 'dotenv';
dotenv.config();

import prisma from './src/lib/prismaClient';
import { hashPassword } from './src/utils/password';

async function main() {
  const pwd = process.env.UNIFIED_PASSWORD || 'Password@123';
  console.log('Hashing password for all users...');
  const hash = await hashPassword(pwd);

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users; updating passwords...`);

  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hash, isLocked: false, failedLoginAttempts: 0, isActive: true } });
  }

  console.log('All users updated to unified password.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
