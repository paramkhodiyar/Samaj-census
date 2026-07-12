const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_SEED !== 'true') {
    console.error('ERROR: Database seeding is disabled. Set ALLOW_SEED=true in your environment.');
    process.exit(1);
  }

  console.log('Starting seed process...');

  // 1. Clean existing records
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.requestChange.deleteMany();
  await prisma.updateRequest.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();
  await prisma.ghatak.deleteMany();
  await prisma.pradeshik.deleteMany();

  console.log('Cleaned database tables.');

  // 2. Seed Pradeshiks
  const gujarat = await prisma.pradeshik.create({
    data: { name: 'Gujarat', code: 'GJ' },
  });
  const maharashtra = await prisma.pradeshik.create({
    data: { name: 'Maharashtra', code: 'MH' },
  });

  console.log('Seeded Pradeshiks.');

  // 3. Seed Ghataks
  const bhuj = await prisma.ghatak.create({
    data: { name: 'Bhuj', code: 'BHJ', pradeshikId: gujarat.id },
  });
  const anjar = await prisma.ghatak.create({
    data: { name: 'Anjar', code: 'ANJ', pradeshikId: gujarat.id },
  });
  const mumbai = await prisma.ghatak.create({
    data: { name: 'Mumbai', code: 'MUM', pradeshikId: maharashtra.id },
  });
  const pune = await prisma.ghatak.create({
    data: { name: 'Pune', code: 'PUN', pradeshikId: maharashtra.id },
  });

  console.log('Seeded Ghataks.');

  // 4. Seed Families & Members (Census Record)
  // Family 1 (Param Family)
  const family1 = await prisma.family.create({
    data: {
      familyId: 'KG-2026-00123',
      headName: 'Param Khodiyar',
      pradeshikId: gujarat.id,
      ghatakId: bhuj.id,
      mobile: '9876543210',
      address: '101 Heritage Residency, Near Lake, Bhuj',
      nativeVillage: 'Kera',
      members: {
        create: [
          {
            name: 'Param Khodiyar',
            relation: 'Head',
            age: 28,
            occupation: 'Business',
            education: 'B.Tech',
            bloodGroup: 'O+',
            mobile: '9876543210',
            email: 'param@khodiyar.org',
            gender: 'MALE',
            maritalStatus: 'SINGLE',
          },
          {
            name: 'Lilaben Khodiyar',
            relation: 'Mother',
            age: 54,
            occupation: 'Homemaker',
            education: 'Secondary',
            bloodGroup: 'A+',
            mobile: '9876543211',
            gender: 'FEMALE',
            maritalStatus: 'WIDOWED',
          },
          {
            name: 'Rohan Khodiyar',
            relation: 'Brother',
            age: 24,
            occupation: 'Software Engineer',
            education: 'M.Tech',
            bloodGroup: 'AB+',
            mobile: '9876543212',
            email: 'rohan@khodiyar.org',
            gender: 'MALE',
            maritalStatus: 'SINGLE',
          },
        ],
      },
    },
  });

  // Family 2 (Rajesh Family)
  const family2 = await prisma.family.create({
    data: {
      familyId: 'KG-2026-00456',
      headName: 'Rajesh Patel',
      pradeshikId: gujarat.id,
      ghatakId: anjar.id,
      mobile: '9898989898',
      address: '52 Samaj Society, Station Road, Anjar',
      nativeVillage: 'Baladiya',
      members: {
        create: [
          {
            name: 'Rajesh Patel',
            relation: 'Head',
            age: 45,
            occupation: 'Agriculture',
            education: 'Higher Secondary',
            bloodGroup: 'O+',
            mobile: '9898989898',
            gender: 'MALE',
            maritalStatus: 'MARRIED',
          },
          {
            name: 'Malti Patel',
            relation: 'Wife',
            age: 40,
            occupation: 'Teacher',
            education: 'B.Ed',
            bloodGroup: 'B+',
            mobile: '9898989899',
            gender: 'FEMALE',
            maritalStatus: 'MARRIED',
          },
          {
            name: 'Sneha Patel',
            relation: 'Daughter',
            age: 16,
            occupation: 'Student',
            education: 'School',
            bloodGroup: 'B+',
            gender: 'FEMALE',
            maritalStatus: 'SINGLE',
          },
        ],
      },
    },
  });

  // Family 3 (Amit Family)
  const family3 = await prisma.family.create({
    data: {
      familyId: 'KG-2026-00789',
      headName: 'Amit Shah',
      pradeshikId: maharashtra.id,
      ghatakId: mumbai.id,
      mobile: '9765432100',
      address: 'B-402 Ocean Heights, Worli, Mumbai',
      nativeVillage: 'Madhapar',
      members: {
        create: [
          {
            name: 'Amit Shah',
            relation: 'Head',
            age: 50,
            occupation: 'Finance',
            education: 'MBA',
            bloodGroup: 'A-',
            mobile: '9765432100',
            gender: 'MALE',
            maritalStatus: 'MARRIED',
          },
          {
            name: 'Ritu Shah',
            relation: 'Wife',
            age: 47,
            occupation: 'Designer',
            education: 'BFA',
            bloodGroup: 'O-',
            gender: 'FEMALE',
            maritalStatus: 'MARRIED',
          },
        ],
      },
    },
  });

  console.log('Seeded Families and Members.');

  // 5. Seed Users
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('AdminPassword123!', saltRounds);
  const pradeshikPassword = await bcrypt.hash('Pradeshik123!', saltRounds);
  const ghatakPassword = await bcrypt.hash('Ghatak123!', saltRounds);
  const userPassword = await bcrypt.hash('UserPassword123!', saltRounds);

  // Super Admin
  await prisma.user.create({
    data: {
      mobileNumber: '9999999999',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });

  // Pradeshik Admin (Gujarat)
  await prisma.user.create({
    data: {
      mobileNumber: '8888888888',
      passwordHash: pradeshikPassword,
      role: 'PRADESHIK_ADMIN',
      pradeshikId: gujarat.id,
      isVerified: true,
    },
  });

  // Ghatak Admin (Bhuj)
  await prisma.user.create({
    data: {
      mobileNumber: '7777777777',
      passwordHash: ghatakPassword,
      role: 'GHATAK_ADMIN',
      ghatakId: bhuj.id,
      pradeshikId: gujarat.id,
      isVerified: true,
    },
  });

  // Pre-registered Family User (Param Khodiyar)
  await prisma.user.create({
    data: {
      mobileNumber: '9876543210',
      passwordHash: userPassword,
      role: 'USER',
      familyId: family1.id,
      isVerified: true,
    },
  });

  console.log('Seeded Users of all roles.');
  console.log('Database Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
