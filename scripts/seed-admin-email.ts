import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx > 0) {
        const key = trimmed.substring(0, equalsIdx).trim();
        let value = trimmed.substring(equalsIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    }
  }
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedAdminEmail() {
  const email = 'paramkhodiyar1008@gmail.com';
  const mobileNumber = '919999999999';

  console.log(`[SEED] Upserting SUPER_ADMIN user for: ${email}...`);

  const existingByMobile = await prisma.user.findUnique({
    where: { mobileNumber },
  });

  let user;
  if (existingByMobile) {
    user = await prisma.user.update({
      where: { mobileNumber },
      data: {
        email,
        role: 'SUPER_ADMIN',
        isVerified: true,
        consentGivenAt: new Date(),
      },
    });
  } else {
    user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'SUPER_ADMIN',
        isVerified: true,
        consentGivenAt: new Date(),
      },
      create: {
        email,
        mobileNumber,
        passwordHash: '',
        role: 'SUPER_ADMIN',
        isVerified: true,
        consentGivenAt: new Date(),
      },
    });
  }

  console.log('\n✅ Successfully registered & activated SUPER_ADMIN user:');
  console.log(`User ID      : ${user.id}`);
  console.log(`Email        : ${user.email}`);
  console.log(`Mobile       : ${user.mobileNumber}`);
  console.log(`Role         : ${user.role}`);
  console.log(`Is Verified  : ${user.isVerified}`);
  console.log('\nYou can now log in directly at /login using: paramkhodiyar1008@gmail.com');
}

seedAdminEmail()
  .catch((err) => {
    console.error('Failed to seed admin email:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
