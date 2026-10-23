const fs = require('fs');
const path = require('path');
const initSqlJs = require('../assets/vendor/sql-wasm.js');

function normalizeMaterial(material, bagCount, finalNetWeight) {
  if (!material) return 'GARAM';
  const upper = material.trim().toUpperCase();
  const isCurah = upper.includes('CURAH');
  const isKarung = upper.includes('KARUNG');

  // If already contains number and unit (e.g. "GARAM 150 KARUNG", "GARAM CURAH 10350.0 KG")
  if (/\d+/.test(upper)) {
    if (upper.includes('KARUNG') || upper.includes('KG') || upper.includes('TON')) {
      return upper;
    }
    return isCurah ? `${upper} KG` : `${upper} KARUNG`;
  }

  // If without numbers (e.g. "Garam Curah", "Garam Karung", "GARAM")
  if (isCurah) {
    const net = parseFloat(finalNetWeight) || 0;
    if (net > 0) {
      const formattedNet = (net % 1 === 0) ? net.toFixed(1) : (Math.round(net * 10) / 10).toFixed(1);
      return `GARAM CURAH ${formattedNet} KG`;
    }
    const bags = parseInt(bagCount, 10) || 0;
    if (bags > 0) {
      return `GARAM CURAH ${bags.toFixed(1)} KG`;
    }
    return 'GARAM CURAH';
  } else {
    const bags = parseInt(bagCount, 10) || 0;
    if (bags > 0) {
      return `GARAM ${bags} KARUNG`;
    }
    return 'GARAM KARUNG';
  }
}

function normalizeDocNo(docNo, date) {
  if (!docNo || typeof docNo !== 'string') return docNo;
  const match = docNo.match(/^PO-RCG\/(\d{4})\/(\d{4,})$/);
  if (match) {
    const year = match[1];
    const seq = match[2];
    const month = (date && date.includes('-')) ? date.split('-')[1].padStart(2, '0') : '01';
    return `PO-RCG/${year}/${month}/${seq}`;
  }
  return docNo;
}

async function migrateDatabase(dbPath, SQL) {
  if (!fs.existsSync(dbPath)) {
    console.log(`Database file not found: ${dbPath}`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`Migrating SQLite Database: ${dbPath}`);
  console.log(`======================================================`);

  const originalBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(originalBuffer);

  // 1. Fetch all transactions
  const res = db.exec("SELECT id, doc_no, date, material, bag_count, final_net_weight FROM transactions;");
  if (!res || !res[0] || !res[0].values) {
    console.log("No transactions found.");
    return;
  }

  const rows = res[0].values;
  console.log(`Found ${rows.length} transactions to examine.`);

  let updatedDocsCount = 0;
  let updatedMaterialsCount = 0;

  db.run("BEGIN TRANSACTION;");

  const updateTxStmt = db.prepare("UPDATE transactions SET doc_no = ?, material = ? WHERE id = ?;");
  const updateLogStmt = db.prepare("UPDATE activity_logs SET doc_no = ? WHERE doc_no = ?;");

  for (const row of rows) {
    const [id, docNo, date, material, bagCount, finalNetWeight] = row;
    const newDocNo = normalizeDocNo(docNo, date);
    const newMaterial = normalizeMaterial(material, bagCount, finalNetWeight);

    let rowChanged = false;
    if (newDocNo !== docNo) {
      updatedDocsCount++;
      rowChanged = true;
      updateLogStmt.run([newDocNo, docNo]);
    }

    if (newMaterial !== material) {
      updatedMaterialsCount++;
      rowChanged = true;
    }

    if (rowChanged) {
      updateTxStmt.run([newDocNo, newMaterial, id]);
    }
  }

  db.run("COMMIT;");
  updateTxStmt.free();
  updateLogStmt.free();

  console.log(`Migration results:`);
  console.log(`  - Converted 3-segment doc_no to 4-segment: ${updatedDocsCount} records`);
  console.log(`  - Normalized material display name: ${updatedMaterialsCount} records`);

  // Write back to disk
  const exportedData = db.export();
  const buffer = Buffer.from(exportedData);
  fs.writeFileSync(dbPath, buffer);
  console.log(`Successfully wrote updated database to: ${dbPath} (${buffer.length} bytes)`);

  // Verify
  const verifyDb = new SQL.Database(buffer);
  const sample3Seg = verifyDb.exec("SELECT COUNT(*) FROM transactions WHERE doc_no NOT LIKE 'PO-RCG/%/%/%';");
  console.log(`Remaining 3-segment doc_no: ${sample3Seg[0]?.values[0][0]}`);
  const sample4Seg = verifyDb.exec("SELECT COUNT(*) FROM transactions WHERE doc_no LIKE 'PO-RCG/%/%/%';");
  console.log(`Total 4-segment doc_no: ${sample4Seg[0]?.values[0][0]}`);
  const unnormalizedMats = verifyDb.exec("SELECT COUNT(*) FROM transactions WHERE material = 'Garam Curah' OR material = 'Garam Karung';");
  console.log(`Remaining unnormalized materials: ${unnormalizedMats[0]?.values[0][0]}`);

  const sampleRows = verifyDb.exec("SELECT doc_no, date, material, final_net_weight FROM transactions ORDER BY rowid DESC LIMIT 5;");
  console.log(`Sample updated rows:`, sampleRows[0]?.values);
}

async function run() {
  const wasmBinary = fs.readFileSync(path.join(__dirname, '../assets/vendor/sql-wasm.wasm'));
  const SQL = await initSqlJs({ wasmBinary });

  const appDataDb = path.join(process.env.APPDATA, 'rcg-salt-weighing-system', 'data', 'rcg_salt_v8.sqlite');
  const localDb = path.join(__dirname, '../data/rcg_database.sqlite');

  await migrateDatabase(appDataDb, SQL);
  await migrateDatabase(localDb, SQL);
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
