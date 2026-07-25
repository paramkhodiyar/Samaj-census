import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
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

async function listUsers() {
  const users = await prisma.user.findMany({
    include: { family: true },
  });

  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Mobile: ${u.mobileNumber} | Role: ${u.role} | Verified: ${u.isVerified} | FamilyId: ${u.familyId}`);
  }

  const members = await prisma.member.findMany({
    where: { email: { not: null } },
  });
  console.log('\n--- MEMBERS WITH EMAIL IN DB ---');
  for (const m of members) {
    console.log(`Name: ${m.name} | Relation: ${m.relation} | Email: ${m.email} | Mobile: ${m.mobile}`);
  }

  const families = await prisma.family.findMany({
    take: 5,
  });
  console.log('\n--- SAMPLE FAMILIES IN DB ---');
  for (const f of families) {
    console.log(`FamilyId: ${f.familyId} | HeadName: ${f.headName} | Mobile: ${f.mobile}`);
  }
}

listUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
