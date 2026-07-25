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

import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

interface SeedUserConfig {
  email: string;
  mobileNumber: string;
  role: Role;
}

async function seedUsers() {
  const usersToSeed: SeedUserConfig[] = [
    {
      email: 'param.khodiyar2024@nst.rishihood.edu.in',
      mobileNumber: '919999999901',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'whatsappbackupparam@gmail.com',
      mobileNumber: '919999999902',
      role: 'NRI_ADMIN',
    },
    {
      email: 'paramkhodiyar1008@gmail.com',
      mobileNumber: '919999999903',
      role: 'USER',
    },
  ];

  console.log('[SEED] Starting user accounts seeding...\n');

  for (const target of usersToSeed) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: target.email },
    });

    let user;
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { email: target.email },
        data: {
          role: target.role,
          isVerified: true,
          consentGivenAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: target.email,
          mobileNumber: target.mobileNumber,
          passwordHash: '',
          role: target.role,
          isVerified: true,
          consentGivenAt: new Date(),
        },
      });
    }

    console.log(`✅ Seeded ${user.role} user:`);
    console.log(`   Email  : ${user.email}`);
    console.log(`   Mobile : ${user.mobileNumber}`);
    console.log(`   Role   : ${user.role}\n`);
  }

  console.log('All 3 accounts seeded successfully!');
}

seedUsers()
  .catch((err) => {
    console.error('Failed to seed user accounts:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
