import fs from 'fs';
import path from 'path';

// Manually load .env.local variables for the test script
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

import { sendLoginOtpEmail, sendResetOtpEmail } from '../lib/email';

async function runEmailTests() {
  console.log('--- Running Real SMTP Email Delivery Test ---');
  console.log(`SMTP Host : ${process.env.SMTP_HOST}`);
  console.log(`SMTP Port : ${process.env.SMTP_PORT}`);
  console.log(`SMTP User : ${process.env.SMTP_USER}`);

  const testRecipient = process.env.SMTP_USER || 'paramkhodiyar1008@gmail.com';
  const testCode1 = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`\nSending Sign-In OTP email to: ${testRecipient}...`);
  const success1 = await sendLoginOtpEmail(testRecipient, testCode1);
  console.log('Login OTP email result:', success1 ? 'SUCCESS - Check your inbox!' : 'FAILED');

  console.log('\n--- Email Test Finished ---');
}

runEmailTests().catch((err) => {
  console.error('Email test runner failed:', err);
  process.exit(1);
});
