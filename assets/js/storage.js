/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Storage & Master Data Layer
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'rcg_transactions_v75',
  ACTIVITY_LOGS: 'rcg_activity_logs_v75',
  SETTINGS: 'rcg_settings_v75',
  AUTH_SESSION: 'rcg_auth_session_v75',
  AUTO_BACKUP: 'rcg_auto_backup_v75',
  USERS: 'rcg_users_v75'
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
    material: 'Garam Karung Super',
    bagCount: 180,
    originRegion: 'Pamekasan',
    originArea: 'Majungan',
    grossWeight: 16500,
    tareWeight: 4200,
    netLoadWeight: 12300,
    refractionPercent: 5.0,
    refractionKg: 615,
    finalNetWeight: 11685,
    k1Weight: 8000,
    k2Weight: 3685,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 10000000,
    k2Total: 3869250,
    grandTotal: 13869250,
    driverName: 'ISMAIL',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Lunas',
    notes: 'Kadar air standar, kualitas bagus'
  },
  {
    id: 'TRX-1724982002',
    docNo: 'PO-RCG/2026/08/0002',
    date: '2026-08-29',
    timeIn: '09:30',
    timeOut: '10:10',
    plateNo: 'M 9102 UB',
    supplier: 'PT. Tambak Garam Madura',
    material: 'Garam Curah K1',
    bagCount: 0,
    originRegion: 'Sumenep',
    originArea: 'Kalianget',
    grossWeight: 22400,
    tareWeight: 5100,
    netLoadWeight: 17300,
    refractionPercent: 4.0,
    refractionKg: 692,
    finalNetWeight: 16608,
    k1Weight: 16608,
    k2Weight: 0,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 20760000,
    k2Total: 0,
    grandTotal: 20760000,
    driverName: 'MAT HASAN',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Lunas',
    notes: 'Garam kristal putih'
  },
  {
    id: 'TRX-1724982003',
    docNo: 'PO-RCG/2026/08/0003',
    date: '2026-08-30',
    timeIn: '07:40',
    timeOut: '08:20',
    plateNo: 'L 9481 CD',
    supplier: 'CV. Garam Madura Abadi',
    material: 'Garam Karung Standar',
    bagCount: 200,
    originRegion: 'Pamekasan',
    originArea: 'Pademawu',
    grossWeight: 18200,
    tareWeight: 4500,
    netLoadWeight: 13700,
    refractionPercent: 6.0,
    refractionKg: 822,
    finalNetWeight: 12878,
    k1Weight: 6000,
    k2Weight: 6878,
    k1Price: 1250,
    k2Price: 1050,
    k1Total: 7500000,
    k2Total: 7221900,
    grandTotal: 14721900,
    driverName: 'BAHRUDIN',
    weighmasterName: 'AFIF',
    adminName: 'admin',
    paymentStatus: 'Belum Lunas',
    notes: 'Pengiriman batch 1'
  }
];

const INITIAL_LOGS = [
  {
    id: 'LOG-1',
    time: '2026-08-30 07:00:12',
    user: 'admin',
    role: 'Administrator',
    activity: 'Login Aplikasi',
    docNo: '-'
  },
  {
    id: 'LOG-2',
    time: '2026-08-30 08:20:45',
    user: 'admin',
    role: 'Administrator',
    activity: 'Simpan Transaksi Baru',
    docNo: 'PO-RCG/2026/08/0003'
  }
];

const INITIAL_SETTINGS = {
  defaultK1Price: 1250,
  defaultK2Price: 1050,
  defaultRefraction: 5.0,
  defaultWeighmaster: 'AFIF',
  darkMode: false,
  autoBackupIntervalMins: 15,
  companyName: 'PT. REKA CIPTA GARAM',
  companyAddress: 'Kawasan Industri Garam Terpadu, Madura - Jawa Timur',
  companyPhone: '(0324) 321888'
};

const StorageManager = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(INITIAL_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    this.createAutoBackup();
  },

  // Transactions
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading transactions', e);
      return [];
    }
  },

  saveTransaction(tx) {
    const list = this.getTransactions();
    const existingIndex = list.findIndex(item => item.id === tx.id || item.docNo === tx.docNo);
    if (existingIndex >= 0) {
      list[existingIndex] = tx;
    } else {
      list.unshift(tx);
    }
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.createAutoBackup();
    return list;
  },

  deleteTransaction(id) {
    let list = this.getTransactions();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.createAutoBackup();
    return list;
  },

  clearAllTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    this.createAutoBackup();
  },

  // Logs
  getLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addLog(user, role, activity, docNo = '-', reason = '-') {
    const logs = this.getLogs();
    const now = new Date();
    const timeStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    logs.unshift({
      id: 'LOG-' + Date.now(),
      time: timeStr,
      user: user || 'admin',
      role: role || 'Administrator',
      activity: activity,
      docNo: docNo,
      reason: reason || '-'
    });

    if (logs.length > 500) logs.length = 500; // retain max 500 logs
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },

  clearLogs() {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Auto Backup & Restore
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
    if (backup.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(backup.transactions));
    if (backup.logs) localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(backup.logs));
    if (backup.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backup.settings));
    return true;
  },

  // Export JSON
  exportJSON() {
    const data = {
      system: 'PT. Reka Cipta Garam - Salt Weighing System',
      version: '7.5.0',
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

  // Import JSON (Supports v7.5 & Legacy v5.0 Archive Formats)
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      let transactionsToImport = [];

      // 1. Direct v7.5 format
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        transactionsToImport = parsed.transactions;
      }
      // 2. Legacy v5.0 format (e.g. PT_RCG_Backup_2026-08-26.json with 237 records)
      else if (parsed.data && Array.isArray(parsed.data)) {
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

  // Export Excel (.xlsx or fallback .csv)
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
  }
};

// Initialize on script load
StorageManager.init();
