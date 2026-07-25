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

async function cleanDatabaseAndSeed3() {
  console.log('[RESET] Cleaning all database records...');

  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.requestChange.deleteMany();
  await prisma.updateRequest.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.otpRateLimit.deleteMany();
  await prisma.ipRateLimit.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();
  await prisma.ghatak.deleteMany();
  await prisma.pradeshik.deleteMany();

  console.log('✅ Database cleaned 100%.');

  // Seed essential clusters
  const gujarat = await prisma.pradeshik.create({
    data: { name: 'Gujarat', code: 'GJ' },
  });

  const bhuj = await prisma.ghatak.create({
    data: { name: 'Bhuj', code: 'BHJ', pradeshikId: gujarat.id },
  });

  console.log('Seeded base Pradeshik & Ghatak.');

  // Seed the 3 requested users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'param.khodiyar2024@nst.rishihood.edu.in',
      mobileNumber: '919000000001',
      passwordHash: '',
      role: 'SUPER_ADMIN',
      isVerified: true,
      consentGivenAt: new Date(),
    },
  });

  const nriAdmin = await prisma.user.create({
    data: {
      email: 'whatsappbackupparam@gmail.com',
      mobileNumber: '919000000002',
      passwordHash: '',
      role: 'NRI_ADMIN',
      isVerified: true,
      consentGivenAt: new Date(),
    },
  });

  const familyHeadUser = await prisma.user.create({
    data: {
      email: 'paramkhodiyar1008@gmail.com',
      mobileNumber: '919000001008',
      passwordHash: '',
      role: 'USER',
      isVerified: true,
      consentGivenAt: new Date(),
    },
  });

  console.log('\n✅ Clean DB seeding complete! ONLY 3 users exist:');
  console.log(`1. Super Admin  : ${superAdmin.email} (${superAdmin.role})`);
  console.log(`2. NRI Admin    : ${nriAdmin.email} (${nriAdmin.role})`);
  console.log(`3. Family Head  : ${familyHeadUser.email} (${familyHeadUser.role})`);
}

cleanDatabaseAndSeed3()
  .catch((err) => {
    console.error('Failed to clean database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
