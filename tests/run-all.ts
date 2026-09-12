import { execSync } from 'child_process';
import path from 'path';

const testFiles = [
  'domain-engine.test.ts',
  'intelligence-engine.test.ts',
  'milestone10-hardware.test.ts',
  'milestone11-end-to-end.test.ts',
  'milestone12-redteam.test.ts',
  'milestone13-mobile.test.ts',
  'milestone14-soil-baseline.test.ts',
  'milestone15-commercial-pilot.test.ts',
  'sprayer-closed-loop.test.ts',
];

// Fall back to local SQLite for zero-config local development.
// In CI or staging, set DATABASE_URL to your PostgreSQL connection string.
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

console.log('====================================================');
console.log('       SOIL IQ - COMPLETE TEST SUITE RUNNER         ');
console.log('====================================================');
console.log(`  DB: ${dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/:\/\/[^@]+@/, '://<credentials>@')}`);
console.log('====================================================\n');

let totalPassed = 0;
let totalFailed = 0;

for (const file of testFiles) {
  const filePath = path.join('tests', file);
  console.log(`\n▶ Running: ${file}`);
  try {
    execSync(`npx tsx "${filePath}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });
    totalPassed++;
  } catch (err) {
    console.error(`❌ FAILED: ${file}`);
    totalFailed++;
  }
}

console.log('\n====================================================');
console.log(`TOTAL SUITES: ${testFiles.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
console.log('====================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
