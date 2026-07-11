import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const csvPath = path.join(__dirname, 'families.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: families.csv not found at ${csvPath}`);
    console.log('Please export your spreadsheet as CSV, name it "families.csv", and place it in the prisma/ directory.');
    process.exit(1);
  }

  console.log('Reading families.csv...');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  // Group data rows
  interface RowData {
    fullName: string;
    mobile: string;
    profession: string;
    country: string;
    city: string;
    indiaHometown: string;
    kutchVillage: string;
    spouseName?: string;
    spouseMobile?: string;
    motherName?: string;
    motherMobile?: string;
    fatherName?: string;
    fatherMobile?: string;
    children: Array<{ name: string; mobile?: string }>;
  }

  const parsedRows: RowData[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);

    // Skip headers or empty lines
    if (cols.length < 5) continue;
    if (cols[0] === 'KGK Member Full Name' || cols[0].includes('Members Details') || cols[0].includes('PROJECT')) {
      continue;
    }
    // Skip category separators (e.g., "Africa - NRI Members")
    if (cols[0].includes('Members') && cols[1] === '') {
      continue;
    }
    
    // Extract column fields based on sheet mapping
    const fullName = cols[0] || '';
    const mobile = cols[1] || '';
    const profession = cols[2] || 'Please Update';
    
    // Country & City
    const country = cols[3] || 'Kenya';
    const city = cols[4] || 'Nairobi';
    
    // India Native Town & Kutch Village
    const indiaHometown = cols[5] || '';
    const kutchVillage = cols[6] || '';

    // Spouse, Mother, Father
    const spouseName = cols[7];
    const spouseMobile = cols[8];
    const motherName = cols[9];
    const motherMobile = cols[10];
    const fatherName = cols[11];
    const fatherMobile = cols[12];

    // Children
    const children: Array<{ name: string; mobile?: string }> = [];
    for (let c = 13; c < cols.length; c += 2) {
      const childName = cols[c];
      const childMobile = cols[c + 1];
      if (childName && childName !== '') {
        children.push({ name: childName, mobile: childMobile });
      }
    }

    if (fullName && mobile) {
      parsedRows.push({
        fullName,
        mobile,
        profession,
        country,
        city,
        indiaHometown,
        kutchVillage,
        spouseName,
        spouseMobile,
        motherName,
        motherMobile,
        fatherName,
        fatherMobile,
        children
      });
    }
  }

  console.log(`Parsed ${parsedRows.length} member rows from CSV.`);

  // Group by Mobile Number to form Families
  const familiesMap = new Map<string, RowData[]>();
  for (const row of parsedRows) {
    if (!familiesMap.has(row.mobile)) {
      familiesMap.set(row.mobile, []);
    }
    familiesMap.get(row.mobile)!.push(row);
  }

  console.log(`Grouped into ${familiesMap.size} unique families based on Mobile Number.`);

  let successCount = 0;
  let nextIndex = 1;

  for (const [mobile, group] of familiesMap.entries()) {
    // Determine the Head
    const headRow = group[0];
    const familyId = `KG-NRI-${String(nextIndex).padStart(5, '0')}`;
    nextIndex++;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Create Family
        const family = await tx.family.create({
          data: {
            familyId,
            headName: headRow.fullName,
            mobile: mobile,
            country: headRow.country,
            city: headRow.city,
            indiaHometown: headRow.indiaHometown,
            kutchVillage: headRow.kutchVillage,
            nativeVillage: headRow.kutchVillage,
            address: `${headRow.city}, ${headRow.country}`,
          },
        });

        // Track member names we've added to avoid duplicates in the same family
        const addedNames = new Set<string>();

        // 2. Add members that have separate rows in this group
        for (const memberRow of group) {
          const relation = memberRow.fullName === headRow.fullName ? 'Head' : 'Family Member';
          
          await tx.member.create({
            data: {
              familyId: family.id,
              name: memberRow.fullName,
              relation,
              age: relation === 'Head' ? 40 : 30, // Placeholders
              occupation: memberRow.profession || 'Please Update',
              education: 'Please Update',
              bloodGroup: 'Please Update',
              mobile: memberRow.mobile,
              gender: 'MALE',
              maritalStatus: relation === 'Head' ? 'MARRIED' : 'SINGLE',
            },
          });
          addedNames.add(memberRow.fullName.toLowerCase());
        }

        // 3. Add nested relatives (Spouse, Father, Mother, Children) if they aren't separately listed in the group
        const addNestedMember = async (name?: string, relation?: string, mob?: string) => {
          if (name && name !== '' && !addedNames.has(name.toLowerCase())) {
            await tx.member.create({
              data: {
                familyId: family.id,
                name,
                relation: relation || 'Family Member',
                age: 30, // Placeholder
                occupation: 'Please Update',
                education: 'Please Update',
                bloodGroup: 'Please Update',
                mobile: mob || null,
                gender: relation === 'Spouse' || relation === 'Mother' ? 'FEMALE' : 'MALE',
                maritalStatus: 'SINGLE',
              },
            });
            addedNames.add(name.toLowerCase());
          }
        };

        // Add Spouse
        if (headRow.spouseName) {
          await addNestedMember(headRow.spouseName, 'Spouse', headRow.spouseMobile);
        }

        // Add Parents
        if (headRow.fatherName) {
          await addNestedMember(headRow.fatherName, 'Father', headRow.fatherMobile);
        }
        if (headRow.motherName) {
          await addNestedMember(headRow.motherName, 'Mother', headRow.motherMobile);
        }

        // Add Children
        for (const child of headRow.children) {
          await addNestedMember(child.name, 'Child', child.mobile);
        }
      });

      successCount++;
    } catch (err) {
      console.error(`Failed to import family with mobile ${mobile}:`, err);
    }
  }

  console.log(`Successfully imported ${successCount} families into the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
