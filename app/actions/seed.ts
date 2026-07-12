'use server';

import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

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

export async function getParsedSeedData() {
  const csvPath = '/Users/paramkhodiyar/.gemini/antigravity-ide/brain/c4d6cf79-e683-4a62-bbc2-fc2aa79a2207/.system_generated/steps/571/content.md';

  if (!fs.existsSync(csvPath)) {
    return { error: 'Seeded CSV temp file not found.' };
  }

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    const parsedFamilies: any[] = [];

    // Temporary grouping map by head mobile
    const familyGroups = new Map<string, any>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCSVLine(line);

      // Skip non-data rows
      if (cols.length < 15) continue;
      
      const rawName = cols[1] || '';
      const rawMobile = cols[3] || '';
      
      if (!rawName || rawName === 'KGK Member Full Name' || rawName.includes('Member Full Name') || rawName.includes('Members Details')) {
        continue;
      }
      
      // Clean mobile number (remove dashes/spaces)
      const mobile = rawMobile.replace(/[-\s]/g, '');
      if (!mobile) continue;

      const name = rawName.trim();
      const profession = cols[9] || 'Please Update';
      const country = cols[11] || 'Kenya';
      
      if (country.trim().toLowerCase() === 'india' || country.trim().toLowerCase() === 'bharat') {
        continue;
      }

      const city = cols[16] || 'Nairobi';
      const indiaHometown = cols[21] || '';
      const kutchVillage = cols[26] || '';

      const spouseName = cols[31];
      const spouseMobile = cols[36] ? cols[36].replace(/[-\s]/g, '') : undefined;
      const motherName = cols[41];
      const motherMobile = cols[46] ? cols[46].replace(/[-\s]/g, '') : undefined;
      const fatherName = cols[51];
      const fatherMobile = cols[56] ? cols[56].replace(/[-\s]/g, '') : undefined;

      // Children
      const children: any[] = [];
      for (let c = 61; c < cols.length; c += 5) {
        const childName = cols[c];
        const childMobile = cols[c + 5] ? cols[c + 5].replace(/[-\s]/g, '') : undefined;
        if (childName && childName.trim() !== '') {
          children.push({ name: childName.trim(), mobile: childMobile });
        }
      }

      const memberInfo = {
        name,
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
      };

      if (!familyGroups.has(mobile)) {
        familyGroups.set(mobile, []);
      }
      familyGroups.get(mobile).push(memberInfo);
    }

    let tempId = 1;
    for (const [mobile, members] of familyGroups.entries()) {
      const head = members[0];
      const familyId = `KG-NRI-${String(tempId).padStart(5, '0')}`;
      tempId++;

      // Assemble all members list inside this family
      const familyMembers: any[] = [];
      const addedNames = new Set<string>();

      // Add direct rows
      for (const m of members) {
        familyMembers.push({
          name: m.name,
          relation: m.name === head.name ? 'Head' : 'Family Member',
          mobile: m.mobile,
          occupation: m.profession,
        });
        addedNames.add(m.name.toLowerCase());
      }

      // Helper to add relative
      const addRelative = (rName?: string, rRelation?: string, rMobile?: string) => {
        if (rName && rName.trim() !== '' && !addedNames.has(rName.toLowerCase())) {
          familyMembers.push({
            name: rName.trim(),
            relation: rRelation,
            mobile: rMobile || null,
            occupation: 'Please Update',
          });
          addedNames.add(rName.toLowerCase());
        }
      };

      if (head.spouseName) addRelative(head.spouseName, 'Spouse', head.spouseMobile);
      if (head.fatherName) addRelative(head.fatherName, 'Father', head.fatherMobile);
      if (head.motherName) addRelative(head.motherName, 'Mother', head.motherMobile);
      for (const child of head.children) {
        addRelative(child.name, 'Child', child.mobile);
      }

      parsedFamilies.push({
        familyId,
        headName: head.name,
        mobile: mobile,
        country: head.country,
        city: head.city,
        indiaHometown: head.indiaHometown,
        kutchVillage: head.kutchVillage,
        members: familyMembers,
      });
    }

    return { success: true, families: parsedFamilies };
  } catch (error: any) {
    console.error('Failed to parse spreadsheet CSV:', error);
    return { error: 'Error occurred parsing spreadsheet data.' };
  }
}

export async function confirmAndSeedAction(families: any[]) {
  if (process.env.ALLOW_SEED !== 'true') {
    return { error: 'Database seeding is disabled. Set ALLOW_SEED=true to seed.' };
  }

  try {
    let importedCount = 0;
    
    for (const f of families) {
      await prisma.$transaction(async (tx) => {
        // Create Family
        const family = await tx.family.create({
          data: {
            familyId: f.familyId,
            headName: f.headName,
            mobile: f.mobile,
            country: f.country,
            city: f.city,
            indiaHometown: f.indiaHometown,
            kutchVillage: f.kutchVillage,
            nativeVillage: f.kutchVillage,
            address: `${f.city}, ${f.country}`,
          },
        });

        // Create Members
        for (const m of f.members) {
          await tx.member.create({
            data: {
              familyId: family.id,
              name: m.name,
              relation: m.relation || 'Family Member',
              age: m.relation === 'Head' ? 42 : (m.relation === 'Spouse' ? 38 : 18),
              occupation: m.occupation || 'Please Update',
              education: 'Please Update',
              bloodGroup: 'Please Update',
              mobile: m.mobile || null,
              gender: m.relation === 'Spouse' || m.relation === 'Mother' ? 'FEMALE' : 'MALE',
              maritalStatus: m.relation === 'Head' || m.relation === 'Spouse' ? 'MARRIED' : 'SINGLE',
            },
          });
        }
      });
      importedCount++;
    }

    return { success: true, count: importedCount };
  } catch (error: any) {
    console.error('Failed seeding records:', error);
    return { error: error.message || 'Error occurred seeding records to database.' };
  }
}
