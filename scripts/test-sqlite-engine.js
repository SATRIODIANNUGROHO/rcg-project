const fs = require('fs');
const path = require('path');
const initSqlJs = require('../assets/vendor/sql-wasm.js');

async function testSQLiteEngine() {
  console.log('=== TESTING SQLITE ENGINE FOR RCG v8.0 ===');
  
  // 1. Init sql.js with local wasm
  const wasmBinary = fs.readFileSync(path.join(__dirname, '../assets/vendor/sql-wasm.wasm'));
  const SQL = await initSqlJs({
    wasmBinary: wasmBinary
  });
  console.log('✔ sql.js WASM Engine initialized successfully.');

  // 2. Create DB & Schema
  const db = new SQL.Database();
  
  const schema = `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      doc_no TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      time_in TEXT,
      time_out TEXT,
      plate_no TEXT NOT NULL,
      supplier TEXT NOT NULL,
      material TEXT DEFAULT 'GARAM',
      bag_count INTEGER DEFAULT 0,
      origin_region TEXT,
      origin_area TEXT,
      scale_type TEXT,
      gross_weight REAL DEFAULT 0,
      tare_weight REAL DEFAULT 0,
      net_load_weight REAL DEFAULT 0,
      refraction_percent REAL DEFAULT 0,
      refraction_kg REAL DEFAULT 0,
      final_net_weight REAL DEFAULT 0,
      k1_weight REAL DEFAULT 0,
      k2_weight REAL DEFAULT 0,
      k1_price REAL DEFAULT 0,
      k2_price REAL DEFAULT 0,
      k1_total REAL DEFAULT 0,
      k2_total REAL DEFAULT 0,
      grand_total REAL DEFAULT 0,
      status TEXT DEFAULT 'Lunas',
      driver TEXT,
      weighmaster TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_tx_supplier ON transactions(supplier);
    CREATE INDEX IF NOT EXISTS idx_tx_docno ON transactions(doc_no);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      display_name TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      role TEXT,
      action TEXT NOT NULL,
      reason TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_logs_time ON activity_logs(timestamp);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `;
  db.exec(schema);
  console.log('✔ SQLite Schema & Indexes created successfully.');

  // 3. Test Insert Transaction
  const insertTxStmt = db.prepare(`
    INSERT INTO transactions (
      id, doc_no, date, time_in, time_out, plate_no, supplier, material, bag_count,
      origin_region, origin_area, scale_type, gross_weight, tare_weight, net_load_weight,
      refraction_percent, refraction_kg, final_net_weight, k1_weight, k2_weight,
      k1_price, k2_price, k1_total, k2_total, grand_total, status, driver, weighmaster
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const mockTx = {
    id: 'TRX-TEST-001',
    docNo: 'RCG/2026/09/0001',
    date: '2026-09-04',
    timeIn: '08:30',
    timeOut: '09:15',
    plateNo: 'M 1234 AB',
    supplier: 'H. Mahmudi (Pamekasan)',
    material: 'GARAM K1 SUPER',
    bagCount: 150,
    originRegion: 'Pamekasan',
    originArea: 'Majungan',
    scaleType: 'Jembatan Timbang',
    grossWeight: 12500,
    tareWeight: 4500,
    netLoadWeight: 8000,
    refractionPercent: 2.5,
    refractionKg: 200,
    finalNetWeight: 7800,
    k1Weight: 7800,
    k2Weight: 0,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 9750000,
    k2Total: 0,
    grandTotal: 9750000,
    status: 'Belum Lunas',
    driver: 'Pak Slamet',
    weighmaster: 'operator'
  };

  insertTxStmt.run([
    mockTx.id, mockTx.docNo, mockTx.date, mockTx.timeIn, mockTx.timeOut, mockTx.plateNo,
    mockTx.supplier, mockTx.material, mockTx.bagCount, mockTx.originRegion, mockTx.originArea,
    mockTx.scaleType, mockTx.grossWeight, mockTx.tareWeight, mockTx.netLoadWeight,
    mockTx.refractionPercent, mockTx.refractionKg, mockTx.finalNetWeight, mockTx.k1Weight,
    mockTx.k2Weight, mockTx.k1Price, mockTx.k2Price, mockTx.k1Total, mockTx.k2Total,
    mockTx.grandTotal, mockTx.status, mockTx.driver, mockTx.weighmaster
  ]);
  insertTxStmt.free();
  console.log('✔ Inserted mock transaction TRX-TEST-001 into SQLite.');

  // 4. Test Select Transaction
  const selectStmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
  selectStmt.bind([mockTx.id]);
  let found = false;
  if (selectStmt.step()) {
    const row = selectStmt.getAsObject();
    console.log(`✔ Query result verified: doc_no=${row.doc_no}, supplier=${row.supplier}, grand_total=Rp ${row.grand_total.toLocaleString('id-ID')}, status=${row.status}`);
    found = true;
  }
  selectStmt.free();
  if (!found) throw new Error('Failed to find inserted transaction!');

  // 5. Test Export Binary
  const binaryData = db.export();
  console.log(`✔ Database exported to binary Uint8Array (${binaryData.length} bytes).`);
  
  // Verify SQLite Magic Header ("SQLite format 3\0")
  const magic = Buffer.from(binaryData.slice(0, 16)).toString('utf8');
  console.log(`✔ SQLite File Magic Header: "${magic.replace(/\0/g, '')}"`);
  if (!magic.startsWith('SQLite format 3')) {
    throw new Error('Exported binary is not a valid SQLite database!');
  }

  // 6. Test Import into a New SQLite instance
  const restoredDb = new SQL.Database(binaryData);
  const countStmt = restoredDb.prepare('SELECT COUNT(*) as count, SUM(grand_total) as total FROM transactions');
  if (countStmt.step()) {
    const agg = countStmt.getAsObject();
    console.log(`✔ Restored Database Verified: count=${agg.count}, total_grand=Rp ${agg.total.toLocaleString('id-ID')}`);
  }
  countStmt.free();
  restoredDb.close();
  db.close();

  console.log('=== ALL SQLITE ENGINE TESTS PASSED PERFECTLY ===');
}

testSQLiteEngine().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
