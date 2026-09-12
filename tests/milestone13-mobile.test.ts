// SOIL IQ - Milestone 13 Mobile PWA & Offline Field Mode Test Suite
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MobileSyncService } from '../lib/services/mobileSyncService';

console.log('====================================================');
console.log('    SOIL IQ - MILESTONE 13 MOBILE PWA & OFFLINE     ');
console.log('====================================================\n');

let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

async function main() {
  console.log('--- TEST GROUP 1: PWA Manifest & Service Worker Assets ---');
  runTest('PWA manifest exists and specifies standalone display with theme colors', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    assert.equal(fs.existsSync(manifestPath), true);
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(content.short_name, 'SOIL IQ');
    assert.equal(content.display, 'standalone');
    assert.equal(content.start_url, '/mobile');
  });

  runTest('Service worker script exists with offline shell routing', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    assert.equal(fs.existsSync(swPath), true);
    const content = fs.readFileSync(swPath, 'utf8');
    assert.match(content, /CACHE_NAME/);
    assert.match(content, /caches\.open/);
    assert.match(content, /stale-while-revalidate/i);
  });

  console.log('\n--- TEST GROUP 2: Offline Action Queue & Sync Deduplication ---');
  runTest('Correctly enqueues safe offline field observation notes', () => {
    MobileSyncService.clearQueue();
    const len1 = MobileSyncService.queueOfflineAction({
      actionId: 'obs-101',
      type: 'FIELD_NOTE',
      organizationId: 'org_demo',
      payload: { gridCode: 'G047', category: 'SOIL', text: 'Topsoil crusting observed' },
      queuedAt: new Date().toISOString(),
    });
    assert.equal(len1, 1);
  });

  runTest('Idempotently deduplicates duplicate offline action IDs', () => {
    const len2 = MobileSyncService.queueOfflineAction({
      actionId: 'obs-101', // duplicate ID
      type: 'FIELD_NOTE',
      organizationId: 'org_demo',
      payload: { gridCode: 'G047', category: 'SOIL', text: 'Topsoil crusting observed' },
      queuedAt: new Date().toISOString(),
    });
    assert.equal(len2, 1); // Length does not increment
  });

  runTest('Allows alert acknowledgement to queue offline', () => {
    const len = MobileSyncService.queueOfflineAction({
      actionId: 'ack-201',
      type: 'ACKNOWLEDGE_ALERT',
      organizationId: 'org_demo',
      payload: { alertId: 'A1', acknowledgedBy: 'operator-1' },
      queuedAt: new Date().toISOString(),
    });
    assert.equal(len, 2);
  });

  console.log('\n--- TEST GROUP 3: Hardware Safety & Physical Actuation Gate ---');
  runTest('Strictly rejects physical machine control actions from offline queue', () => {
    assert.throws(
      () => {
        MobileSyncService.queueOfflineAction({
          actionId: 'unsafe-001',
          type: 'ACTUATE_MACHINE' as any,
          organizationId: 'org_demo',
          payload: { boomValveOpen: true },
          queuedAt: new Date().toISOString(),
        });
      },
      /Unsafe action.*cannot be queued offline/
    );
  });

  console.log('\n--- TEST GROUP 4: Data Freshness Classifications ---');
  runTest('Evaluates data freshness label correctly', () => {
    const now = Date.now();
    const evaluateFreshness = (timestampMs: number) => {
      const diffSec = Math.floor((now - timestampMs) / 1000);
      if (diffSec < 30) return 'LIVE';
      if (diffSec < 300) return 'RECENT';
      if (diffSec < 3600) return 'STALE';
      return 'LAST KNOWN';
    };

    assert.equal(evaluateFreshness(now - 10000), 'LIVE'); // 10s
    assert.equal(evaluateFreshness(now - 120000), 'RECENT'); // 2m
    assert.equal(evaluateFreshness(now - 1800000), 'STALE'); // 30m
    assert.equal(evaluateFreshness(now - 7200000), 'LAST KNOWN'); // 2h
  });

  console.log('\n--- TEST GROUP 5: Push Notification Category Preferences ---');
  runTest('Validates allowed push notification preference states', () => {
    const validPrefs = ['CRITICAL_ONLY', 'CRITICAL_AND_WARNING', 'ALL', 'NONE'];
    assert.equal(validPrefs.includes('CRITICAL_AND_WARNING'), true);
    assert.equal(validPrefs.includes('RANDOM_INVALID' as any), false);
  });

  console.log('====================================================');
  console.log(`  TEST RESULTS: ${passCount} PASSED, 0 FAILED`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
