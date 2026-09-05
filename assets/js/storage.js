/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: SQLite Relational Database Engine & Master Data Layer
 * Powered by SQLite 3 (sql.js WASM) with Disk Persistence & Auto-Migration
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'rcg_transactions_v75',
  ACTIVITY_LOGS: 'rcg_activity_logs_v75',
  SETTINGS: 'rcg_settings_v75',
  AUTH_SESSION: 'rcg_auth_session_v75',
  AUTO_BACKUP: 'rcg_auto_backup_v75',
  USERS: 'rcg_users_v75',
  SQLITE_BIN: 'rcg_sqlite_bin_v8'
};

// Master Data: Wilayah & Desa Tambak Garam Madura (4 Kabupaten, 99 Desa)
const MASTER_ORIGIN_HIERARCHY = {
  'Bangkalan': [
    'Bumianyar',
    'Gili Barat',
    'Kool',
    'Labuhan',
    'Maneron',
    'Moarah',
    'Mrandung',
    'Pasanggrahan',
    'Tlangoh',
    'Tolbuk'
  ],
  'Sampang': [
    'Aengsareh',
    'Apaan',
    'Asemnunggal',
    'Asemraja',
    'Banyuanyar',
    'Dharmacamplong',
    'Disanah',
    'Gulbung',
    'Karangdalem',
    'Klobur',
    'Krampon',
    'Labuhan',
    'Marparan',
    'Masaran',
    'Pangarengan',
    'Plasah',
    'Polagan',
    'Ragung',
    'Sreseh',
    'Taman',
    "Tamba'an"
  ],
  'Pamekasan': [
    'Baddurih',
    'Brantapesisir',
    'Brantatinggi',
    'Bunder',
    'Dasok',
    'Konang',
    'Lembung',
    'Majungan',
    'Padelegan',
    'Pademawu Barat',
    'Pademawu Timur',
    'Pagagan',
    'Pandan',
    'Polagan',
    'Tanjung',
    'Tlanakan',
    'Tlesa'
  ],
  'Sumenep': [
    'Alasmalang',
    'Andulang',
    'Baban',
    'Banbaru',
    'Banjar Barat',
    'Banjar Timur',
    'Banmaleng',
    'Batudinding',
    'Batuputih',
    'Bungin-Bungin',
    'Bunpenang',
    'Cangkramaan',
    'Galis',
    'Gapura Barat',
    'Gapura Tengah',
    'Gedugan',
    'Gelaman',
    'Gersik Putih',
    'Gunggung',
    'Jaddung',
    'Jungkat',
    'Kalianget Barat',
    "Kalimo'ok",
    'Karang Budi',
    'Karanganyar',
    'Karangnangka',
    'Kebundadap Barat',
    'Kebundadap Timur',
    'Kertasada',
    'Kropoh',
    'Lapa Daya',
    'Lapa Taman',
    'Lombang',
    'Marengan Laok',
    'Muangan',
    'Nambakor',
    'Pabian',
    'Pajanangger',
    'Pakamban Laok',
    'Paliat',
    'Paloloan',
    'Pinggir Papas',
    'Poja',
    'Pragaan Laok',
    'Prenduan',
    'Sabuntan',
    'Saroka',
    'Saubi',
    'Sendang',
    'Sender',
    'Talango',
    'Tanjung'
  ]
};

// Initial Seed Data (Madura Salt Industrial Profile)
const INITIAL_TRANSACTIONS = [
  {
    id: 'TRX-1724982001',
    docNo: 'PO-RCG/2026/08/0001',
    date: '2026-08-28',
    timeIn: '08:15',
    timeOut: '08:45',
    plateNo: 'M 8234 UA',
    supplier: 'UD. Garam Sejahtera Madura',
    material: 'Garam Karung',
    bagCount: 180,
    originRegion: 'Pamekasan',
    originArea: 'Majungan',
    grossWeight: 12450,
    tareWeight: 4200,
    netLoadWeight: 8250,
    refractionPercent: 2.0,
    refractionKg: 165,
    finalNetWeight: 8085,
    k1Weight: 6000,
    k2Weight: 2085,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 7500000,
    k2Total: 2189250,
    grandTotal: 9689250,
    driverName: 'ISMAIL',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Lunas',
    notes: 'Kualitas kristal putih bersih standar industri pengolahan'
  },
  {
    id: 'TRX-1724982002',
    docNo: 'PO-RCG/2026/08/0002',
    date: '2026-08-28',
    timeIn: '09:30',
    timeOut: '10:05',
    plateNo: 'M 9122 NC',
    supplier: 'Koperasi Garam Rakyat Sampang',
    material: 'Garam Karung',
    bagCount: 200,
    originRegion: 'Sampang',
    originArea: 'Pangarengan',
    grossWeight: 14200,
    tareWeight: 4500,
    netLoadWeight: 9700,
    refractionPercent: 3.5,
    refractionKg: 340,
    finalNetWeight: 9360,
    k1Weight: 5000,
    k2Weight: 4360,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 6250000,
    k2Total: 4578000,
    grandTotal: 10828000,
    driverName: 'ZAINAL',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Belum Lunas',
    notes: 'Kadar air agak tinggi, susut potongan 3.5%'
  },
  {
    id: 'TRX-1724982003',
    docNo: 'PO-RCG/2026/08/0003',
    date: '2026-08-27',
    timeIn: '13:10',
    timeOut: '13:40',
    plateNo: 'M 8891 UB',
    supplier: 'PT. Madura Garam Prima',
    material: 'Garam Curah',
    bagCount: 0,
    originRegion: 'Sumenep',
    originArea: 'Pinggir Papas',
    grossWeight: 18500,
    tareWeight: 5100,
    netLoadWeight: 13400,
    refractionPercent: 1.5,
    refractionKg: 201,
    finalNetWeight: 13199,
    k1Weight: 13199,
    k2Weight: 0,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 16498750,
    k2Total: 0,
    grandTotal: 16498750,
    driverName: 'ACHMAD',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Lunas',
    notes: 'Pasokan Garam K1 Super Curah tambak Kalianget'
  },
  {
    id: 'TRX-1724982004',
    docNo: 'PO-RCG/2026/08/0004',
    date: '2026-08-27',
    timeIn: '14:25',
    timeOut: '15:00',
    plateNo: 'L 9081 AB',
    supplier: 'Tambak Garam Sentosa Bangkalan',
    material: 'Garam Karung',
    bagCount: 160,
    originRegion: 'Bangkalan',
    originArea: 'Labuhan',
    grossWeight: 11200,
    tareWeight: 3800,
    netLoadWeight: 7400,
    refractionPercent: 2.0,
    refractionKg: 148,
    finalNetWeight: 7252,
    k1Weight: 4000,
    k2Weight: 3252,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 5000000,
    k2Total: 3414600,
    grandTotal: 8414600,
    driverName: 'SAMSUL',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Lunas',
    notes: 'Pengiriman sore, dokumen lengkap'
  }
];

const INITIAL_LOGS = [
  {
    id: 'LOG-1724982001',
    time: '2026-08-28 08:45:10',
    user: 'admin',
    role: 'Administrator',
    activity: 'Simpan Transaksi Baru',
    docNo: 'PO-RCG/2026/08/0001',
    reason: '-'
  },
  {
    id: 'LOG-1724982002',
    time: '2026-08-28 10:05:22',
    user: 'operator',
    role: 'Operator',
    activity: 'Simpan Transaksi Baru',
    docNo: 'PO-RCG/2026/08/0002',
    reason: '-'
  },
  {
    id: 'LOG-1724982003',
    time: '2026-08-27 13:40:55',
    user: 'admin',
    role: 'Administrator',
    activity: 'Simpan Transaksi Baru',
    docNo: 'PO-RCG/2026/08/0003',
    reason: '-'
  }
];

const INITIAL_SETTINGS = {
  priceK1: 1250,
  priceK2: 1050,
  defaultRefraction: 2.0,
  defaultBags: 180,
  serialBaudRate: 9600,
  darkMode: false,
  companyName: 'PT. REKA CIPTA GARAM',
  companyAddress: 'Kawasan Industri Garam Terpadu, Madura - Jawa Timur',
  companyPhone: '(0324) 321888'
};

// =========================================================================
// SQLite Engine Core (sql.js WebAssembly Relational Database Layer)
// =========================================================================

const SQLiteEngine = {
  db: null,
  SQL: null,
  isInitialized: false,
  initPromise: null,

  async init() {
    if (this.isInitialized && this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (typeof window.initSqlJs === 'undefined') {
          console.warn('sql.js not loaded yet, waiting or falling back to localStorage.');
          return null;
        }

        this.SQL = await window.initSqlJs({
          locateFile: file => `assets/vendor/${file}`
        });

        // 1. Load existing SQLite binary file from Electron IPC or localStorage
        let existingBinary = null;
        if (window.electronAPI && typeof window.electronAPI.dbLoadFile === 'function') {
          try {
            const res = await window.electronAPI.dbLoadFile();
            if (res && res.exists && res.data) {
              existingBinary = new Uint8Array(res.data);
            }
          } catch (e) {
            console.error('Failed to load SQLite file from Electron:', e);
          }
        }

        if (!existingBinary) {
          const b64 = localStorage.getItem(STORAGE_KEYS.SQLITE_BIN);
          if (b64) {
            try {
              const binStr = atob(b64);
              const len = binStr.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binStr.charCodeAt(i);
              }
              existingBinary = bytes;
            } catch (e) {}
          }
        }

        // 2. Initialize Database Instance
        if (existingBinary && existingBinary.length > 0) {
          this.db = new this.SQL.Database(existingBinary);
        } else {
          this.db = new this.SQL.Database();
        }

        // 3. Create Schema Tables & Indexes
        this.createSchema();

        // 4. Migrate existing data if SQLite database is newly created
        this.autoMigrateLegacyData();

        this.isInitialized = true;
        this.persist();
        return this.db;
      } catch (err) {
        console.error('Critical: Failed to initialize SQLite Database Engine:', err);
        return null;
      }
    })();

    return this.initPromise;
  },

  createSchema() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        doc_no TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL,
        time_in TEXT,
        time_out TEXT,
        plate_no TEXT NOT NULL,
        supplier TEXT NOT NULL,
        material TEXT NOT NULL,
        bag_count INTEGER DEFAULT 0,
        origin_region TEXT NOT NULL,
        origin_area TEXT NOT NULL,
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
        driver_name TEXT,
        weighmaster_name TEXT,
        admin_name TEXT,
        payment_status TEXT DEFAULT 'Belum Lunas',
        notes TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL,
        permissions_json TEXT NOT NULL,
        avatar_url TEXT,
        initials TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        activity TEXT NOT NULL,
        doc_no TEXT DEFAULT '-',
        reason TEXT DEFAULT '-'
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_tx_supplier ON transactions(supplier);
      CREATE INDEX IF NOT EXISTS idx_tx_docno ON transactions(doc_no);
      CREATE INDEX IF NOT EXISTS idx_logs_time ON activity_logs(timestamp);
    `);
  },

  autoMigrateLegacyData() {
    if (!this.db) return;

    // A. Transactions migration
    const txCountRes = this.db.exec("SELECT COUNT(*) FROM transactions;");
    const txCount = (txCountRes[0] && txCountRes[0].values[0] && txCountRes[0].values[0][0]) || 0;

    if (txCount === 0) {
      let legacyTxs = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        legacyTxs = raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
      } catch (e) {
        legacyTxs = INITIAL_TRANSACTIONS;
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO transactions (
          id, doc_no, date, time_in, time_out, plate_no, supplier, material,
          bag_count, origin_region, origin_area, gross_weight, tare_weight,
          net_load_weight, refraction_percent, refraction_kg, final_net_weight,
          k1_weight, k2_weight, k1_price, k2_price, k1_total, k2_total,
          grand_total, driver_name, weighmaster_name, admin_name, payment_status,
          notes, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
      `);

      this.db.run("BEGIN TRANSACTION;");
      legacyTxs.forEach(t => {
        stmt.run([
          t.id || `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          t.docNo || '-',
          t.date || new Date().toISOString().slice(0, 10),
          t.timeIn || '08:00',
          t.timeOut || '09:00',
          t.plateNo || '-',
          t.supplier || '-',
          t.material || 'Garam Karung',
          parseInt(t.bagCount) || 0,
          t.originRegion || 'Pamekasan',
          t.originArea || 'Majungan',
          parseFloat(t.grossWeight) || 0,
          parseFloat(t.tareWeight) || 0,
          parseFloat(t.netLoadWeight) || 0,
          parseFloat(t.refractionPercent) || 0,
          parseFloat(t.refractionKg) || 0,
          parseFloat(t.finalNetWeight) || 0,
          parseFloat(t.k1Weight) || 0,
          parseFloat(t.k2Weight) || 0,
          parseFloat(t.k1Price) || 1250,
          parseFloat(t.k2Price) || 1050,
          parseFloat(t.k1Total) || 0,
          parseFloat(t.k2Total) || 0,
          parseFloat(t.grandTotal) || 0,
          t.driverName || 'ISMAIL',
          t.weighmasterName || 'AFIF',
          t.adminName || 'admin',
          t.paymentStatus || 'Belum Lunas',
          t.notes || '',
          t.createdAt || (t.date + ' ' + (t.timeIn || '08:00')),
          t.updatedAt || (t.date + ' ' + (t.timeOut || '09:00'))
        ]);
      });
      this.db.run("COMMIT;");
      stmt.free();
    }

    // B. Users migration
    const userCountRes = this.db.exec("SELECT COUNT(*) FROM users;");
    const userCount = (userCountRes[0] && userCountRes[0].values[0] && userCountRes[0].values[0][0]) || 0;

    if (userCount === 0) {
      let legacyUsers = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USERS);
        legacyUsers = raw ? JSON.parse(raw) : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
      } catch (e) {}

      if (legacyUsers.length === 0 && typeof DEFAULT_USERS !== 'undefined') {
        legacyUsers = DEFAULT_USERS;
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO users (
          id, username, password, full_name, email, role, permissions_json, avatar_url, initials, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      this.db.run("BEGIN TRANSACTION;");
      legacyUsers.forEach(u => {
        stmt.run([
          u.id || `USR-${Date.now()}`,
          u.username,
          u.password,
          u.fullName || u.username,
          u.email || `${u.username}@rekaciptagaram.co.id`,
          u.role || 'Operator',
          JSON.stringify(u.permissions || {}),
          u.avatarUrl || null,
          u.initials || 'AD',
          u.createdAt || '2026-08-01 08:00'
        ]);
      });
      this.db.run("COMMIT;");
      stmt.free();
    }

    // C. Activity Logs migration
    const logCountRes = this.db.exec("SELECT COUNT(*) FROM activity_logs;");
    const logCount = (logCountRes[0] && logCountRes[0].values[0] && logCountRes[0].values[0][0]) || 0;

    if (logCount === 0) {
      let legacyLogs = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
        legacyLogs = raw ? JSON.parse(raw) : INITIAL_LOGS;
      } catch (e) {
        legacyLogs = INITIAL_LOGS;
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO activity_logs (
          id, timestamp, username, role, activity, doc_no, reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      this.db.run("BEGIN TRANSACTION;");
      legacyLogs.forEach(l => {
        stmt.run([
          l.id || `LOG-${Date.now()}`,
          l.time || '2026-08-28 08:00:00',
          l.user || 'admin',
          l.role || 'Administrator',
          l.activity || 'Aktivitas Sistem',
          l.docNo || '-',
          l.reason || '-'
        ]);
      });
      this.db.run("COMMIT;");
      stmt.free();
    }

    // D. Settings migration
    const settingCountRes = this.db.exec("SELECT COUNT(*) FROM settings;");
    const settingCount = (settingCountRes[0] && settingCountRes[0].values[0] && settingCountRes[0].values[0][0]) || 0;

    if (settingCount === 0) {
      let legacySettings = INITIAL_SETTINGS;
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (raw) legacySettings = { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
      } catch (e) {}

      const stmt = this.db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`);
      this.db.run("BEGIN TRANSACTION;");
      Object.entries(legacySettings).forEach(([k, v]) => {
        stmt.run([k, JSON.stringify(v)]);
      });
      this.db.run("COMMIT;");
      stmt.free();
    }
  },

  persist() {
    if (!this.db) return;
    try {
      const binary = this.db.export();

      // 1. In Electron: Save to physical disk file (rcg_salt_v8.sqlite)
      if (window.electronAPI && typeof window.electronAPI.dbSaveFile === 'function') {
        window.electronAPI.dbSaveFile(binary).catch(err => {
          console.error('Error saving SQLite file via Electron IPC:', err);
        });
      }

      // 2. In Web / Local: Keep Base64 binary snapshot in localStorage
      try {
        let binaryString = '';
        const chunk = 8192;
        for (let i = 0; i < binary.length; i += chunk) {
          binaryString += String.fromCharCode.apply(null, binary.subarray(i, i + chunk));
        }
        localStorage.setItem(STORAGE_KEYS.SQLITE_BIN, btoa(binaryString));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to persist SQLite database:', err);
    }
  }
};

// =========================================================================
// Storage Manager (Data Access Object & Unified Interface)
// =========================================================================

const StorageManager = {
  async init() {
    // 1. Initialize SQLite Database Engine
    await SQLiteEngine.init();

    // 2. Ensure fallback data integrity
    this.createAutoBackup();
  },

  // -------------------------------------------------------------------------
  // Transactions Management (CRUD)
  // -------------------------------------------------------------------------
  getTransactions() {
    if (SQLiteEngine.db) {
      try {
        const res = SQLiteEngine.db.exec(`
          SELECT * FROM transactions 
          ORDER BY date DESC, time_in DESC, id DESC;
        `);

        if (res && res[0] && res[0].values) {
          const cols = res[0].columns;
          return res[0].values.map(row => {
            const obj = {};
            cols.forEach((col, idx) => {
              obj[col] = row[idx];
            });

            return {
              id: obj.id,
              docNo: obj.doc_no,
              date: obj.date,
              timeIn: obj.time_in,
              timeOut: obj.time_out,
              plateNo: obj.plate_no,
              supplier: obj.supplier,
              material: obj.material,
              bagCount: obj.bag_count,
              originRegion: obj.origin_region,
              originArea: obj.origin_area,
              grossWeight: obj.gross_weight,
              tareWeight: obj.tare_weight,
              netLoadWeight: obj.net_load_weight,
              refractionPercent: obj.refraction_percent,
              refractionKg: obj.refraction_kg,
              finalNetWeight: obj.final_net_weight,
              k1Weight: obj.k1_weight,
              k2Weight: obj.k2_weight,
              k1Price: obj.k1_price,
              k2Price: obj.k2_price,
              k1Total: obj.k1_total,
              k2Total: obj.k2_total,
              grandTotal: obj.grand_total,
              driverName: obj.driver_name,
              weighmasterName: obj.weighmaster_name,
              adminName: obj.admin_name,
              paymentStatus: (obj.payment_status && obj.payment_status.trim().toLowerCase() === 'lunas') ? 'Lunas' : 'Belum Lunas',
              notes: obj.notes,
              createdAt: obj.created_at,
              updatedAt: obj.updated_at
            };
          });
        }
      } catch (e) {
        console.error('Error querying transactions from SQLite:', e);
      }
    }

    // Fallback if SQLite is pending
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch (e) {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransaction(tx) {
    if (SQLiteEngine.db) {
      try {
        const stmt = SQLiteEngine.db.prepare(`
          INSERT INTO transactions (
            id, doc_no, date, time_in, time_out, plate_no, supplier, material,
            bag_count, origin_region, origin_area, gross_weight, tare_weight,
            net_load_weight, refraction_percent, refraction_kg, final_net_weight,
            k1_weight, k2_weight, k1_price, k2_price, k1_total, k2_total,
            grand_total, driver_name, weighmaster_name, admin_name, payment_status,
            notes, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          ) ON CONFLICT(id) DO UPDATE SET
            doc_no = excluded.doc_no,
            date = excluded.date,
            time_in = excluded.time_in,
            time_out = excluded.time_out,
            plate_no = excluded.plate_no,
            supplier = excluded.supplier,
            material = excluded.material,
            bag_count = excluded.bag_count,
            origin_region = excluded.origin_region,
            origin_area = excluded.origin_area,
            gross_weight = excluded.gross_weight,
            tare_weight = excluded.tare_weight,
            net_load_weight = excluded.net_load_weight,
            refraction_percent = excluded.refraction_percent,
            refraction_kg = excluded.refraction_kg,
            final_net_weight = excluded.final_net_weight,
            k1_weight = excluded.k1_weight,
            k2_weight = excluded.k2_weight,
            k1_price = excluded.k1_price,
            k2_price = excluded.k2_price,
            k1_total = excluded.k1_total,
            k2_total = excluded.k2_total,
            grand_total = excluded.grand_total,
            driver_name = excluded.driver_name,
            weighmaster_name = excluded.weighmaster_name,
            admin_name = excluded.admin_name,
            payment_status = excluded.payment_status,
            notes = excluded.notes,
            updated_at = excluded.updated_at;
        `);

        const now = new Date();
        const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        stmt.run([
          tx.id,
          tx.docNo,
          tx.date,
          tx.timeIn || '',
          tx.timeOut || '',
          tx.plateNo,
          tx.supplier,
          tx.material,
          parseInt(tx.bagCount) || 0,
          tx.originRegion || 'Pamekasan',
          tx.originArea || 'Majungan',
          parseFloat(tx.grossWeight) || 0,
          parseFloat(tx.tareWeight) || 0,
          parseFloat(tx.netLoadWeight) || 0,
          parseFloat(tx.refractionPercent) || 0,
          parseFloat(tx.refractionKg) || 0,
          parseFloat(tx.finalNetWeight) || 0,
          parseFloat(tx.k1Weight) || 0,
          parseFloat(tx.k2Weight) || 0,
          parseFloat(tx.k1Price) || 1250,
          parseFloat(tx.k2Price) || 1050,
          parseFloat(tx.k1Total) || 0,
          parseFloat(tx.k2Total) || 0,
          parseFloat(tx.grandTotal) || 0,
          tx.driverName || 'ISMAIL',
          tx.weighmasterName || 'AFIF',
          tx.adminName || 'admin',
          tx.paymentStatus || 'Belum Lunas',
          tx.notes || '',
          tx.createdAt || nowStr,
          nowStr
        ]);
        stmt.free();
        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error saving transaction in SQLite:', e);
      }
    }

    // Sync fallback localStorage
    const list = this.getTransactions();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.createAutoBackup();
    return list;
  },

  deleteTransaction(id) {
    if (SQLiteEngine.db) {
      try {
        SQLiteEngine.db.run("DELETE FROM transactions WHERE id = ?;", [id]);
        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error deleting transaction in SQLite:', e);
      }
    }

    const list = this.getTransactions();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.createAutoBackup();
    return list;
  },

  clearAllTransactions() {
    if (SQLiteEngine.db) {
      try {
        SQLiteEngine.db.run("DELETE FROM transactions;");
        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error clearing transactions in SQLite:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    this.createAutoBackup();
  },

  // -------------------------------------------------------------------------
  // Activity Logs Management
  // -------------------------------------------------------------------------
  getLogs() {
    if (SQLiteEngine.db) {
      try {
        const res = SQLiteEngine.db.exec("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 500;");
        if (res && res[0] && res[0].values) {
          const cols = res[0].columns;
          return res[0].values.map(row => {
            const obj = {};
            cols.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            return {
              id: obj.id,
              time: obj.timestamp,
              user: obj.username,
              role: obj.role,
              activity: obj.activity,
              docNo: obj.doc_no,
              reason: obj.reason
            };
          });
        }
      } catch (e) {
        console.error('Error querying logs from SQLite:', e);
      }
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch (e) {
      return INITIAL_LOGS;
    }
  },

  addLog(user, role, activity, docNo = '-', reason = '-') {
    const now = new Date();
    const timeStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const logId = 'LOG-' + Date.now();

    if (SQLiteEngine.db) {
      try {
        SQLiteEngine.db.run(`
          INSERT INTO activity_logs (id, timestamp, username, role, activity, doc_no, reason)
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `, [logId, timeStr, user || 'admin', role || 'Administrator', activity, docNo || '-', reason || '-']);

        // Retain max 500 logs
        SQLiteEngine.db.run(`
          DELETE FROM activity_logs 
          WHERE id NOT IN (
            SELECT id FROM activity_logs ORDER BY timestamp DESC LIMIT 500
          );
        `);

        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error adding log in SQLite:', e);
      }
    }

    // Sync localStorage
    const logs = this.getLogs();
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },

  clearLogs() {
    if (SQLiteEngine.db) {
      try {
        SQLiteEngine.db.run("DELETE FROM activity_logs;");
        SQLiteEngine.persist();
      } catch (e) {}
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
  },

  // -------------------------------------------------------------------------
  // Settings Management
  // -------------------------------------------------------------------------
  getSettings() {
    if (SQLiteEngine.db) {
      try {
        const res = SQLiteEngine.db.exec("SELECT key, value FROM settings;");
        if (res && res[0] && res[0].values) {
          const loaded = {};
          res[0].values.forEach(([k, v]) => {
            try { loaded[k] = JSON.parse(v); } catch (e) { loaded[k] = v; }
          });
          return { ...INITIAL_SETTINGS, ...loaded };
        }
      } catch (e) {}
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings) {
    if (SQLiteEngine.db) {
      try {
        const stmt = SQLiteEngine.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);");
        SQLiteEngine.db.run("BEGIN TRANSACTION;");
        Object.entries(settings).forEach(([k, v]) => {
          stmt.run([k, JSON.stringify(v)]);
        });
        SQLiteEngine.db.run("COMMIT;");
        stmt.free();
        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error saving settings in SQLite:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // -------------------------------------------------------------------------
  // Users Management
  // -------------------------------------------------------------------------
  getUsers() {
    if (SQLiteEngine.db) {
      try {
        const res = SQLiteEngine.db.exec("SELECT * FROM users ORDER BY created_at ASC;");
        if (res && res[0] && res[0].values) {
          const cols = res[0].columns;
          return res[0].values.map(row => {
            const obj = {};
            cols.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            let perms = {};
            try { perms = JSON.parse(obj.permissions_json); } catch (e) {}
            return {
              id: obj.id,
              username: obj.username,
              password: obj.password,
              fullName: obj.full_name,
              email: obj.email,
              role: obj.role,
              permissions: perms,
              avatarUrl: obj.avatar_url,
              initials: obj.initials,
              createdAt: obj.created_at
            };
          });
        }
      } catch (e) {}
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
    } catch (e) {
      return (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
    }
  },

  saveUsers(users) {
    if (SQLiteEngine.db) {
      try {
        SQLiteEngine.db.run("DELETE FROM users;");
        const stmt = SQLiteEngine.db.prepare(`
          INSERT INTO users (
            id, username, password, full_name, email, role, permissions_json, avatar_url, initials, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `);

        SQLiteEngine.db.run("BEGIN TRANSACTION;");
        users.forEach(u => {
          stmt.run([
            u.id || `USR-${Date.now()}`,
            u.username,
            u.password,
            u.fullName || u.username,
            u.email || `${u.username}@rekaciptagaram.co.id`,
            u.role || 'Operator',
            JSON.stringify(u.permissions || {}),
            u.avatarUrl || null,
            u.initials || 'AD',
            u.createdAt || '2026-08-01 08:00'
          ]);
        });
        SQLiteEngine.db.run("COMMIT;");
        stmt.free();
        SQLiteEngine.persist();
      } catch (e) {
        console.error('Error saving users in SQLite:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // -------------------------------------------------------------------------
  // Auto Backup & Restore
  // -------------------------------------------------------------------------
  createAutoBackup() {
    const backupData = {
      timestamp: new Date().toISOString(),
      transactions: this.getTransactions(),
      logs: this.getLogs(),
      settings: this.getSettings()
    };
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, JSON.stringify(backupData));
  },

  getAutoBackup() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  restoreAutoBackup() {
    const backup = this.getAutoBackup();
    if (!backup) return false;
    if (backup.transactions && Array.isArray(backup.transactions)) {
      if (SQLiteEngine.db) {
        SQLiteEngine.db.run("DELETE FROM transactions;");
        const stmt = SQLiteEngine.db.prepare(`
          INSERT INTO transactions (
            id, doc_no, date, time_in, time_out, plate_no, supplier, material,
            bag_count, origin_region, origin_area, gross_weight, tare_weight,
            net_load_weight, refraction_percent, refraction_kg, final_net_weight,
            k1_weight, k2_weight, k1_price, k2_price, k1_total, k2_total,
            grand_total, driver_name, weighmaster_name, admin_name, payment_status,
            notes, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          );
        `);
        SQLiteEngine.db.run("BEGIN TRANSACTION;");
        backup.transactions.forEach(t => {
          stmt.run([
            t.id, t.docNo, t.date, t.timeIn || '', t.timeOut || '', t.plateNo, t.supplier, t.material,
            parseInt(t.bagCount) || 0, t.originRegion, t.originArea, parseFloat(t.grossWeight) || 0,
            parseFloat(t.tareWeight) || 0, parseFloat(t.netLoadWeight) || 0, parseFloat(t.refractionPercent) || 0,
            parseFloat(t.refractionKg) || 0, parseFloat(t.finalNetWeight) || 0, parseFloat(t.k1Weight) || 0,
            parseFloat(t.k2Weight) || 0, parseFloat(t.k1Price) || 1250, parseFloat(t.k2Price) || 1050,
            parseFloat(t.k1Total) || 0, parseFloat(t.k2Total) || 0, parseFloat(t.grandTotal) || 0,
            t.driverName || 'ISMAIL', t.weighmasterName || 'AFIF', t.adminName || 'admin',
            t.paymentStatus || 'Belum Lunas', t.notes || '', t.createdAt || '', t.updatedAt || ''
          ]);
        });
        SQLiteEngine.db.run("COMMIT;");
        stmt.free();
        SQLiteEngine.persist();
      }
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(backup.transactions));
    }
    if (backup.logs) localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(backup.logs));
    if (backup.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backup.settings));
    return true;
  },

  // -------------------------------------------------------------------------
  // SQLite Binary Export & Import (.sqlite / .db)
  // -------------------------------------------------------------------------
  async exportSQLite() {
    if (!SQLiteEngine.db) {
      await SQLiteEngine.init();
    }
    if (!SQLiteEngine.db) {
      if (typeof App !== 'undefined') App.showToast('Database SQLite belum siap diekspor.', 'warning');
      return;
    }

    const binary = SQLiteEngine.db.export();
    const defaultFilename = `RCG_Database_${new Date().toISOString().slice(0, 10)}.sqlite`;

    if (window.electronAPI && typeof window.electronAPI.dbExportFile === 'function') {
      const res = await window.electronAPI.dbExportFile(binary, defaultFilename);
      if (res && res.success) {
        if (typeof App !== 'undefined') App.showToast(`Database SQLite berhasil diekspor ke: ${res.filePath}`, 'success');
      }
    } else {
      // Browser Web Download
      const blob = new Blob([binary], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (typeof App !== 'undefined') App.showToast('File database SQLite (.sqlite) berhasil diunduh.', 'success');
    }
  },

  async importSQLite(fileOrBuffer) {
    try {
      let binaryData = null;
      if (fileOrBuffer instanceof Uint8Array || fileOrBuffer instanceof ArrayBuffer) {
        binaryData = new Uint8Array(fileOrBuffer);
      } else if (fileOrBuffer instanceof Blob || fileOrBuffer instanceof File) {
        const arrayBuf = await fileOrBuffer.arrayBuffer();
        binaryData = new Uint8Array(arrayBuf);
      }

      if (!binaryData || binaryData.length === 0) {
        return { success: false, message: 'Berkas database kosong atau tidak valid.' };
      }

      // Create safety auto-backup before replacing
      this.createAutoBackup();

      // Load into SQLite Engine
      if (!SQLiteEngine.SQL) {
        await SQLiteEngine.init();
      }

      SQLiteEngine.db = new SQLiteEngine.SQL.Database(binaryData);
      SQLiteEngine.createSchema();
      SQLiteEngine.persist();

      // Sync local storage cache
      const txs = this.getTransactions();
      const logs = this.getLogs();
      const settings = this.getSettings();
      const users = this.getUsers();

      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return { success: true, count: txs.length };
    } catch (e) {
      console.error('Error importing SQLite database:', e);
      return { success: false, error: e.message };
    }
  },

  // -------------------------------------------------------------------------
  // JSON Backup Export & Import (Legacy Support)
  // -------------------------------------------------------------------------
  exportJSON() {
    const data = {
      system: 'PT. Reka Cipta Garam - Salt Weighing System',
      version: '8.0',
      database: 'SQLite 3 (rcg_salt_v8.sqlite)',
      exportedAt: new Date().toISOString(),
      transactions: this.getTransactions(),
      logs: this.getLogs(),
      settings: this.getSettings()
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `RCG_Weighing_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  },

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      let transactionsToImport = [];

      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        transactionsToImport = parsed.transactions;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        transactionsToImport = parsed.data.map(item => {
          let formattedDate = item.date;
          if (item.tanggal && item.tanggal.includes('/')) {
            const parts = item.tanggal.split('/');
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          const gross = parseFloat(item.beratKotor) || parseFloat(item.grossWeight) || 0;
          const tare = parseFloat(item.beratTara) || parseFloat(item.tareWeight) || 0;
          const netLoad = parseFloat(item.beratMuatan) || parseFloat(item.netLoadWeight) || (gross - tare);
          const refrPct = parseFloat(item.refraksi) || parseFloat(item.refractionPercent) || 0;
          const refrKg = Math.round(netLoad * (refrPct / 100));
          const finalNet = parseFloat(item.beratBersihTotal) || parseFloat(item.finalNetWeight) || (netLoad - refrKg);
          const k1W = (item.beratK1 !== undefined) ? parseFloat(item.beratK1) : finalNet;
          const k2W = (item.beratK2 !== undefined) ? parseFloat(item.beratK2) : 0;
          const k1P = parseFloat(item.hargaK1) || parseFloat(item.k1Price) || 1250;
          const k2P = parseFloat(item.hargaK2) || parseFloat(item.k2Price) || 1050;
          const k1Tot = Math.round(k1W * k1P);
          const k2Tot = Math.round(k2W * k2P);
          const gTot = k1Tot + k2Tot;

          return {
            id: item.id || `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            docNo: item.noDok || item.docNo || '-',
            date: formattedDate || '2026-08-01',
            timeIn: item.jamMasuk ? item.jamMasuk.replace(' WIB', '').trim() : (item.timeIn || '08:00'),
            timeOut: item.jamKeluar ? item.jamKeluar.replace(' WIB', '').trim() : (item.timeOut || '09:00'),
            plateNo: item.noPol || item.plateNo || '-',
            supplier: item.namaPemasok || item.supplier || '-',
            material: item.material || 'GARAM',
            bagCount: parseInt(item.jumlahMaterial || item.bagCount) || 0,
            originRegion: item.kabupaten || item.originRegion || 'Pamekasan',
            originArea: item.desa || item.originArea || 'Majungan',
            grossWeight: gross,
            tareWeight: tare,
            netLoadWeight: netLoad,
            refractionPercent: refrPct,
            refractionKg: refrKg,
            finalNetWeight: finalNet,
            k1Weight: k1W,
            k2Weight: k2W,
            k1Price: k1P,
            k2Price: k2P,
            k1Total: k1Tot,
            k2Total: k2Tot,
            grandTotal: gTot,
            driverName: item.supir || item.driverName || '-',
            weighmasterName: item.admin || item.weighmasterName || 'AFIF',
            adminName: item.admin || 'admin',
            paymentStatus: item.paymentStatus || 'Lunas',
            notes: item.notes || (item.jenisMaterial ? `Jenis: ${item.jenisMaterial}` : '')
          };
        });
      }

      if (transactionsToImport.length > 0) {
        if (SQLiteEngine.db) {
          SQLiteEngine.db.run("DELETE FROM transactions;");
          const stmt = SQLiteEngine.db.prepare(`
            INSERT INTO transactions (
              id, doc_no, date, time_in, time_out, plate_no, supplier, material,
              bag_count, origin_region, origin_area, gross_weight, tare_weight,
              net_load_weight, refraction_percent, refraction_kg, final_net_weight,
              k1_weight, k2_weight, k1_price, k2_price, k1_total, k2_total,
              grand_total, driver_name, weighmaster_name, admin_name, payment_status,
              notes, created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            );
          `);
          SQLiteEngine.db.run("BEGIN TRANSACTION;");
          transactionsToImport.forEach(t => {
            stmt.run([
              t.id, t.docNo, t.date, t.timeIn || '', t.timeOut || '', t.plateNo, t.supplier, t.material,
              parseInt(t.bagCount) || 0, t.originRegion, t.originArea, parseFloat(t.grossWeight) || 0,
              parseFloat(t.tareWeight) || 0, parseFloat(t.netLoadWeight) || 0, parseFloat(t.refractionPercent) || 0,
              parseFloat(t.refractionKg) || 0, parseFloat(t.finalNetWeight) || 0, parseFloat(t.k1Weight) || 0,
              parseFloat(t.k2Weight) || 0, parseFloat(t.k1Price) || 1250, parseFloat(t.k2Price) || 1050,
              parseFloat(t.k1Total) || 0, parseFloat(t.k2Total) || 0, parseFloat(t.grandTotal) || 0,
              t.driverName || 'ISMAIL', t.weighmasterName || 'AFIF', t.adminName || 'admin',
              t.paymentStatus || 'Belum Lunas', t.notes || '', t.createdAt || '', t.updatedAt || ''
            ]);
          });
          SQLiteEngine.db.run("COMMIT;");
          stmt.free();
          SQLiteEngine.persist();
        }
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactionsToImport));
      }

      if (parsed.logs && Array.isArray(parsed.logs)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(parsed.logs));
      }
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }

      this.createAutoBackup();
      return { success: true, count: transactionsToImport.length };
    } catch (e) {
      console.error('Import error', e);
      return { success: false, error: e.message };
    }
  },

  // -------------------------------------------------------------------------
  // Export Excel (.xlsx or fallback .csv)
  // -------------------------------------------------------------------------
  exportExcel() {
    const txs = this.getTransactions();
    if (typeof XLSX !== 'undefined') {
      const dataForExcel = txs.map((t, idx) => ({
        'No': idx + 1,
        'No. Dokumen': t.docNo,
        'Tanggal': t.date,
        'Waktu Masuk': t.timeIn || '-',
        'Waktu Keluar': t.timeOut || '-',
        'No. Polisi': t.plateNo,
        'Pemasok': t.supplier,
        'Material': t.material,
        'Jml Karung': t.bagCount || 0,
        'Wilayah': t.originRegion,
        'Area/Kec': t.originArea,
        'Gross/Kotor (Kg)': t.grossWeight,
        'Tare/Tara (Kg)': t.tareWeight,
        'Muatan/Bruto (Kg)': t.netLoadWeight,
        'Refraksi (%)': t.refractionPercent,
        'Potongan (Kg)': t.refractionKg,
        'Bersih Total (Kg)': t.finalNetWeight,
        'K1 (Kg)': t.k1Weight,
        'K2 (Kg)': t.k2Weight,
        'Harga K1 (Rp)': t.k1Price,
        'Harga K2 (Rp)': t.k2Price,
        'Total K1 (Rp)': t.k1Total,
        'Total K2 (Rp)': t.k2Total,
        'TOTAL AKHIR (Rp)': t.grandTotal,
        'Status Pembayaran': t.paymentStatus,
        'Supir': t.driverName,
        'Petugas Timbang': t.weighmasterName,
        'Admin': t.adminName,
        'Catatan': t.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Riwayat Penimbangan");
      XLSX.writeFile(wb, `RCG_Riwayat_Timbangan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      // Fallback CSV
      let csv = 'No,No Dokumen,Tanggal,No Polisi,Pemasok,Material,Gross,Tare,Bruto,Bersih Total,K1,K2,Grand Total,Payment\n';
      txs.forEach((t, i) => {
        csv += `"${i+1}","${t.docNo}","${t.date}","${t.plateNo}","${t.supplier}","${t.material}","${t.grossWeight}","${t.tareWeight}","${t.netLoadWeight}","${t.finalNetWeight}","${t.k1Weight}","${t.k2Weight}","${t.grandTotal}","${t.paymentStatus}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const dl = document.createElement('a');
      dl.href = url;
      dl.download = `RCG_Riwayat_Timbangan_${new Date().toISOString().slice(0, 10)}.csv`;
      dl.click();
    }
  },

  // -------------------------------------------------------------------------
  // SQLite Diagnostic & Direct Query Helpers
  // -------------------------------------------------------------------------
  getEngineInfo() {
    const isReady = !!(SQLiteEngine.isInitialized && SQLiteEngine.db);
    let txCount = 0;
    let userCount = 0;
    let logCount = 0;
    let dbSize = '0 KB';

    if (isReady) {
      try {
        const txRes = SQLiteEngine.db.exec("SELECT COUNT(*) as c FROM transactions");
        if (txRes.length && txRes[0].values.length) txCount = txRes[0].values[0][0];

        const uRes = SQLiteEngine.db.exec("SELECT COUNT(*) as c FROM users");
        if (uRes.length && uRes[0].values.length) userCount = uRes[0].values[0][0];

        const lRes = SQLiteEngine.db.exec("SELECT COUNT(*) as c FROM activity_logs");
        if (lRes.length && lRes[0].values.length) logCount = lRes[0].values[0][0];

        const bin = SQLiteEngine.db.export();
        dbSize = `${(bin.length / 1024).toFixed(2)} KB (${bin.length.toLocaleString('id-ID')} bytes)`;
      } catch (e) {
        console.error('Error fetching engine info:', e);
      }
    }

    return {
      engine: 'SQLite 3 (sql.js WebAssembly Relational Database)',
      status: isReady ? 'ACTIVE & OPERATIONAL' : 'INITIALIZING / FALLBACK',
      tables: ['transactions', 'users', 'activity_logs', 'settings'],
      indexes: ['idx_tx_date', 'idx_tx_supplier', 'idx_tx_docno', 'idx_logs_time'],
      totalTransactions: txCount,
      totalUsers: userCount,
      totalLogs: logCount,
      databaseBinarySize: dbSize,
      persistenceTarget: (window.electronAPI && typeof window.electronAPI.dbSaveFile === 'function') 
        ? 'data/rcg_database.sqlite & %APPDATA%/userData (Disk Persistence)'
        : 'Browser Memory & Local Binary Cache'
    };
  },

  query(sql, params = []) {
    if (!SQLiteEngine.db) {
      throw new Error('SQLite Database Engine is not initialized yet.');
    }
    const stmt = SQLiteEngine.db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
};

// Immediate initialization on script load
StorageManager.init().catch(console.error);
