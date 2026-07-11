'use server';

import { prisma } from '@/lib/prisma';
import { clearAuthCookies, getAuthSession, setAuthCookies, signRefreshToken, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Validators
const loginSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number is required'),
  otp: z.string().min(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
});

// Helper: Send WhatsApp OTP (Supports Twilio & Meta Cloud API)
async function sendWhatsAppOTP(mobileNumber: string, code: string) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  let cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  // 1. Try Twilio if credentials are provided
  if (twilioSid && twilioAuthToken) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:+${cleanPhone}`,
          From: twilioFrom,
          Body: `Your Shri Kutch Gurjar Kshatriya Samaj Census Portal OTP is: ${code}\n\nValid for 10 minutes. Please do not share this code.`,
        }),
      });

      const data = await response.json();
      console.log('[OTP SERVICE] Twilio WhatsApp API response:', data);
      return;
    } catch (error) {
      console.error('[OTP SERVICE] Twilio failed:', error);
    }
  }

  // 2. Fall back to Meta Cloud API
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'auth_otp';

  if (!token || !phoneNumberId) {
    console.log(`[OTP SERVICE] No Meta or Twilio WhatsApp credentials configured.`);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    // Build payload dynamically based on template type
    const templatePayload: any = {
      name: templateName,
      language: { code: 'en_US' },
    };

    if (templateName === 'hello_world') {
      // No parameters needed
    } else if (templateName === 'jaspers_market_order_confirmation_v1') {
      templatePayload.components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'User' },
            { type: 'text', text: code }, // Sent as order number
            { type: 'text', text: '10 mins' },
          ],
        },
      ];
    } else {
      templatePayload.components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: templatePayload,
      }),
    });

    const data = await response.json();
    console.log('[OTP SERVICE] Meta WhatsApp API response:', data);
  } catch (error) {
    console.error('[OTP SERVICE] Failed to send WhatsApp message:', error);
  }
}

// Helper: Generate OTP
async function generateAndSaveOTP(mobileNumber: string) {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Store in database
  await prisma.verificationCode.create({
    data: {
      mobileNumber,
      code,
      expiresAt,
    },
  });

  // Log to server console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}: ${code} (Development Log)`);
  } else {
    console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}`);
  }
  
  // Dispatch to WhatsApp (runs asynchronously in background)
  sendWhatsAppOTP(mobileNumber, code);

  return code;
}

export async function sendOtpAction(mobileNumber: string) {
  if (!mobileNumber) {
    return { error: 'Mobile number is required' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      // User not registered. Check if they are in the census as head
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: { mobile: mobileNumber },
        });

        if (isMember) {
          return { error: 'BLOCKED_NON_HEAD' };
        }

        return { error: 'UNREGISTERED' };
      }
    }

    // Make sure registered users with role 'USER' are indeed heads
    if (user && user.role === 'USER') {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
    }

    // Generate and save OTP
    await generateAndSaveOTP(mobileNumber);
    return { success: true };
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return { error: 'Failed to send OTP. Try again.' };
  }
}

// Action: Password Login
export async function loginAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const password = formData.get('password') as string;

  if (!mobileNumber || !password) {
    return { error: 'Mobile number and password are required' };
  }

  const result = loginSchema.safeParse({ mobileNumber, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      // Check census database to give detailed UX advice
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (isHead) {
        return { error: 'NOT_ACTIVATED' };
      }

      const isMember = await prisma.member.findFirst({
        where: { mobile: mobileNumber },
      });

      if (isMember) {
        return { error: 'BLOCKED_NON_HEAD' };
      }

      return { error: 'UNREGISTERED' };
    }

    // Verify role constraint
    if (user.role === 'USER') {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid mobile number or password' };
    }

    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Create audit log for login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        description: `User logged in using password. Role: ${user.role}`,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard?auth=login');
}

// Action: OTP Login
export async function loginOtpAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const otp = formData.get('otp') as string;

  if (!mobileNumber || !otp) {
    return { error: 'Mobile number and OTP are required' };
  }

  try {
    let user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: { mobile: mobileNumber },
        });

        if (isMember) {
          return { error: 'BLOCKED_NON_HEAD' };
        }

        return { error: 'UNREGISTERED' };
      }

      // Auto-activate: Find the pre-existing family
      const family = await prisma.family.findFirst({
        where: {
          OR: [
            { mobile: mobileNumber },
            { members: { some: { mobile: mobileNumber, relation: 'Head' } } }
          ]
        }
      });

      if (!family) {
        return { error: 'Census family records not found' };
      }

      // Verify OTP first before creating the user
      const verification = await prisma.verificationCode.findFirst({
        where: {
          mobileNumber,
          code: otp,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return { error: 'Invalid or expired OTP' };
      }

      // Create new active User account
      user = await prisma.user.create({
        data: {
          mobileNumber,
          familyId: family.id,
          role: 'USER',
          isVerified: true,
          passwordHash: '',
        }
      });
    } else {
      // Verify role constraint for existing user
      if (user.role === 'USER') {
        const isHead =
          (await prisma.family.findFirst({
            where: { mobile: mobileNumber },
          })) ||
          (await prisma.member.findFirst({
            where: { mobile: mobileNumber, relation: 'Head' },
          }));

        if (!isHead) {
          return { error: 'BLOCKED_NON_HEAD' };
        }
      }

      // Verify OTP for existing user
      const verification = await prisma.verificationCode.findFirst({
        where: {
          mobileNumber,
          code: otp,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return { error: 'Invalid or expired OTP' };
      }
    }

    // Clean up OTP codes
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber },
    });

    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        description: `User logged in using OTP. Role: ${user.role}`,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error('OTP Login error:', error);
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard?auth=login');
}

// Action: Register User
export async function registerAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = registerSchema.safeParse({
    mobileNumber,
    otp,
    password,
    confirmPassword,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    // 1. Verify OTP
    const verification = await prisma.verificationCode.findFirst({
      where: {
        mobileNumber,
        code: otp,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { error: 'Invalid or expired OTP' };
    }

    // 2. Fetch the pre-existing family matching this mobile number as Head
    const family = await prisma.family.findFirst({
      where: {
        OR: [
          { mobile: mobileNumber },
          { members: { some: { mobile: mobileNumber, relation: 'Head' } } }
        ]
      },
      include: { members: true },
    });

    if (!family) {
      return { error: 'Family records not found in census records' };
    }

    // ONLY Family head is allowed to register
    const isHead =
      family.mobile === mobileNumber ||
      family.members.some(member => member.mobile === mobileNumber && member.relation === 'Head');

    if (!isHead) {
      const isMember = family.members.some(member => member.mobile === mobileNumber);
      if (isMember) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
      return { error: 'Mobile number does not match this family record' };
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create or Update User
    const user = await prisma.user.upsert({
      where: { mobileNumber },
      update: {
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
      },
      create: {
        mobileNumber,
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
      },
    });

    // Clean verification codes
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber },
    });

    // Sign in automatically
    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'REGISTER',
        description: `New user registered. Linked to Family ID: ${family.familyId}`,
        userId: user.id,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.message || 'An error occurred during registration' };
  }

  redirect('/dashboard?auth=register');
}

// Action: Logout
export async function logoutAction() {
  await clearAuthCookies();
  redirect('/login');
}

// Action: Change Password
export async function changePasswordAction(prevState: any, formData: FormData) {
  const userId = formData.get('userId') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PASSWORD',
        description: 'User updated their account password.',
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to update password.' };
  }
}

// Action: Check Mobile Number Status
export async function checkMobileNumberAction(mobileNumber: string) {
  if (!mobileNumber) return { error: 'Mobile number is required' };

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (user) {
      if (user.role === 'USER') {
        const isHead =
          (await prisma.family.findFirst({
            where: { mobile: mobileNumber },
          })) ||
          (await prisma.member.findFirst({
            where: { mobile: mobileNumber, relation: 'Head' },
          }));

        if (!isHead) {
          return { status: 'BLOCKED_NON_HEAD' };
        }
      }
      return { status: 'ACTIVE' };
    }

    // User does not exist, check census database
    const isHead =
      (await prisma.family.findFirst({
        where: { mobile: mobileNumber },
      })) ||
      (await prisma.member.findFirst({
        where: { mobile: mobileNumber, relation: 'Head' },
      }));

    if (isHead) {
      return { status: 'NOT_ACTIVATED' };
    }

    const isMember = await prisma.member.findFirst({
      where: { mobile: mobileNumber },
    });

    if (isMember) {
      return { status: 'BLOCKED_NON_HEAD' };
    }

    return { status: 'UNREGISTERED' };
  } catch (error) {
    console.error('Check mobile error:', error);
    return { error: 'Failed to verify mobile number.' };
  }
}

// Action: Export NRI Families to CSV
export async function exportNriFamiliesAction() {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Load User and role
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!user || user.role !== 'NRI_ADMIN') {
    throw new Error('Unauthorized');
  }

  // Fetch only NRI families (familyId starts with 'KG-NRI-')
  const families = await prisma.family.findMany({
    where: { familyId: { startsWith: 'KG-NRI-' } },
    include: { members: true },
  });

  // Find the maximum number of other relatives in any single family
  let maxRelatives = 0;
  for (const family of families) {
    const relativeCount = family.members.filter(m => 
      m.relation !== 'Head' && 
      !['Wife', 'Husband', 'Spouse'].includes(m.relation)
    ).length;
    if (relativeCount > maxRelatives) {
      maxRelatives = relativeCount;
    }
  }

  // Define static headers
  const headers = [
    'Family ID', 'Country', 'City', 'Kutch Village',
    'Head Name', 'Head Relation', 'Head Mobile', 'Head Profession',
    'Spouse Name', 'Spouse Relation', 'Spouse Mobile', 'Spouse Profession'
  ];

  // Append dynamic relative columns
  for (let i = 1; i <= maxRelatives; i++) {
    headers.push(
      `Relative ${i} Name`,
      `Relative ${i} Relation`,
      `Relative ${i} Mobile`,
      `Relative ${i} Profession`
    );
  }

  const csvRows = [headers.join(',')];

  for (const family of families) {
    const head = family.members.find(m => m.relation === 'Head');
    const spouse = family.members.find(m => 
      ['Wife', 'Husband', 'Spouse'].includes(m.relation)
    );
    const relatives = family.members
      .filter(m => m !== head && m !== spouse)
      .sort((a, b) => b.age - a.age);

    const row = [
      `"${family.familyId}"`,
      `"${family.country || 'N/A'}"`,
      `"${family.city || 'N/A'}"`,
      `"${family.kutchVillage || 'N/A'}"`,
      `"${head?.name || family.headName}"`,
      `"${head?.relation || 'Head'}"`,
      `"${head?.mobile || family.mobile}"`,
      `"${head?.occupation || 'N/A'}"`,
      `"${spouse?.name || ''}"`,
      `"${spouse?.relation || ''}"`,
      `"${spouse?.mobile || ''}"`,
      `"${spouse?.occupation || ''}"`
    ];

    for (let i = 0; i < maxRelatives; i++) {
      const rel = relatives[i];
      row.push(
        `"${rel?.name || ''}"`,
        `"${rel?.relation || ''}"`,
        `"${rel?.mobile || ''}"`,
        `"${rel?.occupation || ''}"`
      );
    }

    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}
