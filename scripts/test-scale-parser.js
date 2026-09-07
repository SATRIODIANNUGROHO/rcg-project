/**
 * Test Scale Engine Parser Logic
 */

// Simulated parser test
function testParser(rawString, protocol = 'auto') {
  let parsedWeight = null;
  let isStable = true;
  const trimmed = rawString.trim();

  if (trimmed.includes('US') || trimmed.includes('OL') || trimmed.includes('?') || trimmed.includes('MO')) {
    isStable = false;
  } else if (trimmed.includes('ST') || trimmed.includes('GS') || trimmed.includes('NT')) {
    isStable = true;
  }

  // 1. Yaohua format: =DDDDDD
  const yaohuaRevMatch = trimmed.match(/=\s*([0-9]{6})/);
  if (yaohuaRevMatch) {
    const reversed = yaohuaRevMatch[1].split('').reverse().join('');
    const val = parseInt(reversed, 10);
    if (!isNaN(val)) {
      parsedWeight = val;
    }
  }

  // 2. CAS Format (CI-1560A, CI-2001A)
  if (parsedWeight === null) {
    const casMatch = trimmed.match(/(?:ST|US|OL)\s*,\s*(?:GS|NT)\s*,\s*([+-]?\s*\d+(?:\.\d+)?)/i);
    if (casMatch) {
      const cleanVal = parseFloat(casMatch[1].replace(/\s+/g, ''));
      if (!isNaN(cleanVal)) {
        parsedWeight = Math.round(cleanVal);
      }
    }
  }

  // 3. Generic ASCII
  if (parsedWeight === null) {
    const generalMatch = trimmed.match(/([+-]?\s*\d+(?:[\.,]\d+)?)/);
    if (generalMatch) {
      const cleanVal = parseFloat(generalMatch[0].replace(/\s+/g, '').replace(',', '.'));
      if (!isNaN(cleanVal)) {
        parsedWeight = Math.round(cleanVal);
      }
    }
  }

  return { weight: parsedWeight, isStable };
}

const testCases = [
  { input: '=005610\r', expectedWeight: 16500, expectedStable: true, desc: 'Yaohua A12E reversed (=005610 -> 16500 kg)' },
  { input: 'ST,GS,+016500kg\r\n', expectedWeight: 16500, expectedStable: true, desc: 'CAS Stable (+16500 kg)' },
  { input: 'US,GS,+016480kg\r\n', expectedWeight: 16480, expectedStable: false, desc: 'CAS Unstable (+16480 kg)' },
  { input: 'ST,NT,+008250kg\r\n', expectedWeight: 8250, expectedStable: true, desc: 'CAS Net (+8250 kg)' },
  { input: '  12450 kg\r', expectedWeight: 12450, expectedStable: true, desc: 'Toledo generic ASCII' },
  { input: '+25000\n', expectedWeight: 25000, expectedStable: true, desc: 'Generic signed number' }
];

let allPassed = true;
testCases.forEach((tc, idx) => {
  const result = testParser(tc.input);
  const pass = result.weight === tc.expectedWeight && result.isStable === tc.expectedStable;
  console.log(`Test ${idx + 1} [${pass ? 'PASS' : 'FAIL'}]: ${tc.desc} -> Result: ${result.weight} kg, Stable: ${result.isStable}`);
  if (!pass) allPassed = false;
});

if (allPassed) {
  console.log('\nALL 6 WEIGHING INDICATOR PARSER TESTS PASSED 100%!');
  process.exit(0);
} else {
  console.error('\nSOME TESTS FAILED!');
  process.exit(1);
}
