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

async function resetRateLimits() {
  console.log('Clearing rate limit locks...');
  await prisma.otpRateLimit.deleteMany();
  await prisma.ipRateLimit.deleteMany();
  await prisma.verificationCode.deleteMany();
  console.log('✅ All rate limit locks and expired OTP verification codes cleared successfully!');
}

resetRateLimits()
  .catch((err) => {
    console.error('Failed to reset rate limits:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
