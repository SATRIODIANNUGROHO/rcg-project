/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Weighing Transaction Processing & Calculations
 */

const TransactionEngine = {
  activeTxId: null,
  activeDocNo: '',
  isEditingExisting: false,

  // Hierarchy Data for Salt Origin (Bangkalan, Sampang, Pamekasan, Sumenep)
  originHierarchy: (typeof MASTER_ORIGIN_HIERARCHY !== 'undefined') ? MASTER_ORIGIN_HIERARCHY : {
    'Bangkalan': ['Bumianyar', 'Gili Barat', 'Kool', 'Labuhan', 'Maneron', 'Moarah', 'Mrandung', 'Pasanggrahan', 'Tlangoh', 'Tolbuk'],
    'Sampang': ['Aengsareh', 'Apaan', 'Asemnunggal', 'Asemraja', 'Banyuanyar', 'Dharmacamplong', 'Disanah', 'Gulbung', 'Karangdalem', 'Klobur', 'Krampon', 'Labuhan', 'Marparan', 'Masaran', 'Pangarengan', 'Plasah', 'Polagan', 'Ragung', 'Sreseh', 'Taman', "Tamba'an"],
    'Pamekasan': ['Baddurih', 'Brantapesisir', 'Brantatinggi', 'Bunder', 'Dasok', 'Konang', 'Lembung', 'Majungan', 'Padelegan', 'Pademawu Barat', 'Pademawu Timur', 'Pagagan', 'Pandan', 'Polagan', 'Tanjung', 'Tlanakan', 'Tlesa'],
    'Sumenep': ['Alasmalang', 'Andulang', 'Baban', 'Banbaru', 'Banjar Barat', 'Banjar Timur', 'Banmaleng', 'Batudinding', 'Batuputih', 'Bungin-Bungin', 'Bunpenang', 'Cangkramaan', 'Galis', 'Gapura Barat', 'Gapura Tengah', 'Gedugan', 'Gelaman', 'Gersik Putih', 'Gunggung', 'Jaddung', 'Jungkat', 'Kalianget Barat', "Kalimo'ok", 'Karang Budi', 'Karanganyar', 'Karangnangka', 'Kebundadap Barat', 'Kebundadap Timur', 'Kertasada', 'Kropoh', 'Lapa Daya', 'Lapa Taman', 'Lombang', 'Marengan Laok', 'Muangan', 'Nambakor', 'Pabian', 'Pajanangger', 'Pakamban Laok', 'Paliat', 'Paloloan', 'Pinggir Papas', 'Poja', 'Pragaan Laok', 'Prenduan', 'Sabuntan', 'Saroka', 'Saubi', 'Sendang', 'Sender', 'Talango', 'Tanjung']
  },

  init() {
    this.bindEvents();
    this.populateOrigins();
    this.newTransaction();
  },

  bindEvents() {
    // Live calculation bindings
    const calcInputs = [
      'input-gross-weight', 'input-tare-weight', 'input-refraction-percent',
      'input-k1-weight', 'input-k2-weight', 'input-k1-price', 'input-k2-price'
    ];

    calcInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => this.handleCalculation(e.target.id));
      }
    });

    // Region dropdown change updates Area
    const regionSelect = document.getElementById('select-origin-region');
    if (regionSelect) {
      regionSelect.addEventListener('change', () => this.updateAreaDropdown());
    }

    // Material dropdown change updates unit tag
    const materialSelect = document.getElementById('select-material');
    if (materialSelect) {
      materialSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const unitTag = document.querySelector('#input-bag-count ~ .unit-tag');
        if (unitTag) {
          unitTag.textContent = val.includes('Curah') ? 'Kg' : 'Karung';
        }
      });
    }

    // Hapus/Reset Weight buttons
    const btnCaptureGross = document.getElementById('btn-capture-gross');
    if (btnCaptureGross) {
      btnCaptureGross.addEventListener('click', () => {
        document.getElementById('input-gross-weight').value = 0;
        this.handleCalculation('input-gross-weight');
      });
    }

    const btnCaptureTare = document.getElementById('btn-capture-tare');
    if (btnCaptureTare) {
      btnCaptureTare.addEventListener('click', () => {
        document.getElementById('input-tare-weight').value = 0;
        this.handleCalculation('input-tare-weight');
      });
    }

    // Set today button
    const btnToday = document.getElementById('btn-set-today');
    if (btnToday) {
      btnToday.addEventListener('click', () => {
        const today = new Date().toISOString().slice(0, 10);
        document.getElementById('input-doc-date').value = today;
      });
    }

    // Action buttons
    const btnNew = document.getElementById('btn-new-transaction');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.newTransaction());
    }

    const btnSave = document.getElementById('btn-save-transaction');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveTransaction());
    }

    const btnPrint = document.getElementById('btn-print-nota');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.printCurrentNota());
    }
  },

  populateOrigins() {
    const regionSelect = document.getElementById('select-origin-region');
    if (!regionSelect) return;

    regionSelect.innerHTML = '';
    Object.keys(this.originHierarchy).forEach(region => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      regionSelect.appendChild(opt);
    });
    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.sync(regionSelect);
    }
    this.updateAreaDropdown();
  },

  updateAreaDropdown(selectedArea = null) {
    const regionSelect = document.getElementById('select-origin-region');
    const areaSelect = document.getElementById('select-origin-area');
    if (!regionSelect || !areaSelect) return;

    const currentRegion = regionSelect.value;
    const areas = this.originHierarchy[currentRegion] || [];

    areaSelect.innerHTML = '';
    areas.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = area;
      areaSelect.appendChild(opt);
    });

    if (selectedArea && areas.includes(selectedArea)) {
      areaSelect.value = selectedArea;
    }

    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.sync(areaSelect);
    }
  },

  generateDocumentNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const txs = StorageManager.getTransactions();

    // Find sequence numbers for current month
    const prefix = `PO-RCG/${year}/${month}/`;
    let maxSeq = 0;

    txs.forEach(t => {
      if (t.docNo && t.docNo.startsWith(`PO-RCG/${year}/`)) {
        const parts = t.docNo.split('/');
        const seq = parseInt(parts[parts.length - 1]);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    return `PO-RCG/${year}/${month}/${nextSeq}`;
  },

  newTransaction() {
    this.isEditingExisting = false;
    this.activeTxId = 'TRX-' + Date.now();
    this.activeDocNo = this.generateDocumentNumber();

    const settings = StorageManager.getSettings();
    const currentUser = AuthManager.getCurrentUser();

    // Form inputs reset
    this.activeDocNo = this.generateDocumentNumber();
    const docNoInput = document.getElementById('input-doc-no');
    if (docNoInput) docNoInput.value = this.activeDocNo;

    const docDateInput = document.getElementById('input-doc-date');
    if (docDateInput) docDateInput.value = new Date().toISOString().slice(0, 10);

    const nowStr = new Date().toTimeString().slice(0, 5);
    const timeInInput = document.getElementById('input-time-in');
    if (timeInInput) timeInInput.value = nowStr;

    const timeOutInput = document.getElementById('input-time-out');
    if (timeOutInput) timeOutInput.value = nowStr;

    const plateNoInput = document.getElementById('input-plate-no');
    if (plateNoInput) plateNoInput.value = '';

    const supplierInput = document.getElementById('input-supplier');
    if (supplierInput) supplierInput.value = '';

    const materialSelect = document.getElementById('select-material');
    if (materialSelect) materialSelect.value = 'Garam Karung';

    const bagCountInput = document.getElementById('input-bag-count');
    if (bagCountInput) bagCountInput.value = '180';

    const regionSelect = document.getElementById('select-origin-region');
    if (regionSelect) regionSelect.value = 'Pamekasan';
    this.updateAreaDropdown('Majungan');

    const grossInput = document.getElementById('input-gross-weight');
    if (grossInput) grossInput.value = '0';

    const tareInput = document.getElementById('input-tare-weight');
    if (tareInput) tareInput.value = '0';

    const netLoadInput = document.getElementById('input-net-load');
    if (netLoadInput) netLoadInput.value = '0';

    const refPercentInput = document.getElementById('input-refraction-percent');
    if (refPercentInput) refPercentInput.value = settings.defaultRefraction || 5.0;

    const refKgInput = document.getElementById('input-refraction-kg');
    if (refKgInput) refKgInput.value = '0';

    const finalNetInput = document.getElementById('input-final-net');
    if (finalNetInput) finalNetInput.value = '0';

    const k1WeightInput = document.getElementById('input-k1-weight');
    if (k1WeightInput) k1WeightInput.value = '0';

    const k2WeightInput = document.getElementById('input-k2-weight');
    if (k2WeightInput) k2WeightInput.value = '0';

    const k1PriceInput = document.getElementById('input-k1-price');
    if (k1PriceInput) k1PriceInput.value = settings.defaultK1Price || 1250;

    const k2PriceInput = document.getElementById('input-k2-price');
    if (k2PriceInput) k2PriceInput.value = settings.defaultK2Price || 1050;

    const k1TotalInput = document.getElementById('input-k1-total');
    if (k1TotalInput) k1TotalInput.value = '0';

    const k2TotalInput = document.getElementById('input-k2-total');
    if (k2TotalInput) k2TotalInput.value = '0';

    const grandTotalDisplay = document.getElementById('display-grand-total');
    if (grandTotalDisplay) grandTotalDisplay.textContent = 'Rp 0';

    const driverNameInput = document.getElementById('input-driver-name');
    if (driverNameInput) driverNameInput.value = '';

    const weighmasterInput = document.getElementById('input-weighmaster');
    if (weighmasterInput) weighmasterInput.value = settings.defaultWeighmaster || 'AFIF';

    const adminNameInput = document.getElementById('input-admin-name');
    if (adminNameInput) adminNameInput.value = currentUser.username || 'admin';

    const paymentStatusSelect = document.getElementById('select-payment-status');
    if (paymentStatusSelect) paymentStatusSelect.value = 'Lunas';

    const notesInput = document.getElementById('input-notes');
    if (notesInput) notesInput.value = '';

    const btnSave = document.getElementById('btn-save-transaction');
    if (btnSave) btnSave.textContent = 'Simpan Transaksi';

    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.syncAll();
    }

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) {
      draftMsg.textContent = 'Draf penimbangan baru siap digunakan.';
      draftMsg.style.color = '';
    }

    if (typeof AuthManager !== 'undefined' && AuthManager.updateUserUI) {
      AuthManager.updateUserUI();
    }
  },

  handleCalculation(triggerId) {
    const gross = Math.max(0, parseFloat(document.getElementById('input-gross-weight').value) || 0);
    const tare = Math.max(0, parseFloat(document.getElementById('input-tare-weight').value) || 0);
    const refPercent = Math.max(0, parseFloat(document.getElementById('input-refraction-percent').value) || 0);
    const k1Price = Math.max(0, parseFloat(document.getElementById('input-k1-price').value) || 0);
    const k2Price = Math.max(0, parseFloat(document.getElementById('input-k2-price').value) || 0);

    // 1. Bruto (Muatan) = Gross - Tare
    const netLoad = Math.max(0, gross - tare);
    document.getElementById('input-net-load').value = netLoad.toLocaleString('id-ID');

    // 2. Refraksi Potongan (Kg) = Bruto * Refraksi % / 100
    const refractionKg = Math.round(netLoad * (refPercent / 100));
    document.getElementById('input-refraction-kg').value = refractionKg.toLocaleString('id-ID');

    // 3. Bersih Total = Bruto - Refraksi Kg
    const finalNet = Math.max(0, netLoad - refractionKg);
    document.getElementById('input-final-net').value = finalNet.toLocaleString('id-ID');

    // 4. K1 vs K2 Split Logic
    let k1 = parseFloat(document.getElementById('input-k1-weight').value) || 0;
    let k2 = parseFloat(document.getElementById('input-k2-weight').value) || 0;

    if (triggerId === 'input-k1-weight') {
      k1 = Math.min(finalNet, Math.max(0, k1));
      k2 = Math.max(0, finalNet - k1);
      document.getElementById('input-k2-weight').value = k2;
    } else if (triggerId === 'input-k2-weight') {
      k2 = Math.min(finalNet, Math.max(0, k2));
      k1 = Math.max(0, finalNet - k2);
      document.getElementById('input-k1-weight').value = k1;
    } else {
      // Auto distribution if gross/tare/refraction changed
      if (k1 === 0 && k2 === 0) {
        k1 = finalNet;
        k2 = 0;
      } else {
        const totalPrevious = (k1 + k2) || 1;
        const ratioK1 = k1 / totalPrevious;
        k1 = Math.round(finalNet * ratioK1);
        k2 = Math.max(0, finalNet - k1);
      }
      document.getElementById('input-k1-weight').value = k1;
      document.getElementById('input-k2-weight').value = k2;
    }

    // 5. Total Prices
    const k1Total = Math.round(k1 * k1Price);
    const k2Total = Math.round(k2 * k2Price);
    const grandTotal = k1Total + k2Total;

    document.getElementById('input-k1-total').value = 'Rp ' + k1Total.toLocaleString('id-ID');
    document.getElementById('input-k2-total').value = 'Rp ' + k2Total.toLocaleString('id-ID');
    document.getElementById('display-grand-total').textContent = 'Rp ' + grandTotal.toLocaleString('id-ID');
  },

  getCurrentFormData() {
    const gross = Math.max(0, parseFloat(document.getElementById('input-gross-weight').value) || 0);
    const tare = Math.max(0, parseFloat(document.getElementById('input-tare-weight').value) || 0);
    const netLoad = Math.max(0, gross - tare);
    const refPercent = Math.max(0, parseFloat(document.getElementById('input-refraction-percent').value) || 0);
    const refractionKg = Math.round(netLoad * (refPercent / 100));
    const finalNet = Math.max(0, netLoad - refractionKg);
    const k1 = parseFloat(document.getElementById('input-k1-weight').value) || 0;
    const k2 = parseFloat(document.getElementById('input-k2-weight').value) || 0;
    const k1Price = parseFloat(document.getElementById('input-k1-price').value) || 0;
    const k2Price = parseFloat(document.getElementById('input-k2-price').value) || 0;
    const k1Total = Math.round(k1 * k1Price);
    const k2Total = Math.round(k2 * k2Price);
    const grandTotal = k1Total + k2Total;

    return {
      id: this.activeTxId,
      docNo: document.getElementById('input-doc-no').value.trim() || this.activeDocNo,
      date: document.getElementById('input-doc-date').value,
      timeIn: document.getElementById('input-time-in').value || '-',
      timeOut: document.getElementById('input-time-out').value || '-',
      plateNo: document.getElementById('input-plate-no').value.trim().toUpperCase(),
      supplier: document.getElementById('input-supplier').value.trim(),
      material: document.getElementById('select-material').value,
      bagCount: parseInt(document.getElementById('input-bag-count').value) || 0,
      originRegion: document.getElementById('select-origin-region').value,
      originArea: document.getElementById('select-origin-area').value,
      grossWeight: gross,
      tareWeight: tare,
      netLoadWeight: netLoad,
      refractionPercent: refPercent,
      refractionKg: refractionKg,
      finalNetWeight: finalNet,
      k1Weight: k1,
      k2Weight: k2,
      k1Price: k1Price,
      k2Price: k2Price,
      k1Total: k1Total,
      k2Total: k2Total,
      grandTotal: grandTotal,
      driverName: (document.getElementById('input-driver-name')?.value.trim().toUpperCase()) || 'ISMAIL',
      weighmasterName: (document.getElementById('input-weighmaster')?.value.trim().toUpperCase()) || 'AFIF',
      adminName: (AuthManager.getCurrentUser() && AuthManager.getCurrentUser().username) || 'admin',
      paymentStatus: document.getElementById('select-payment-status').value,
      notes: document.getElementById('input-notes').value.trim()
    };
  },

  saveTransaction() {
    if (typeof AuthManager !== 'undefined') {
      if (!this.isEditingExisting && !AuthManager.canAddTransaction()) {
        App.showToast('Akun Anda tidak memiliki hak akses untuk menambah transaksi baru!', 'warning');
        return false;
      }
      if (this.isEditingExisting && !AuthManager.canEditTransaction()) {
        App.showToast('Akun Anda tidak memiliki hak akses untuk mengubah data transaksi!', 'warning');
        return false;
      }
    }

    const tx = this.getCurrentFormData();

    // Validations
    if (!tx.plateNo) {
      App.showToast('Nomor Polisi Kendaraan wajib diisi!', 'warning');
      document.getElementById('input-plate-no').focus();
      return false;
    }
    if (!tx.supplier) {
      App.showToast('Nama Pemasok / Supplier wajib diisi!', 'warning');
      document.getElementById('input-supplier').focus();
      return false;
    }
    if (tx.grossWeight <= 0) {
      App.showToast('Berat Kotor (Gross) harus lebih dari 0 Kg!', 'warning');
      return false;
    }
    if (tx.grossWeight <= tx.tareWeight) {
      App.showToast('Berat Kotor harus lebih besar dari Berat Tara!', 'warning');
      return false;
    }

    // Save to storage
    StorageManager.saveTransaction(tx);
    StorageManager.addLog(
      AuthManager.getCurrentUser().username,
      AuthManager.getCurrentUser().role,
      this.isEditingExisting ? `Update Transaksi Penimbangan` : `Simpan Transaksi Baru`,
      tx.docNo
    );

    App.showToast(`Transaksi ${tx.docNo} berhasil disimpan!`, 'success');
    
    // Refresh tables and analytics
    HistoryManager.render();
    if (typeof SupplierHistoryManager !== 'undefined') {
      SupplierHistoryManager.render();
    }
    AnalyticsManager.render();
    App.renderActivityLogs();

    // Populate print preview modal
    this.preparePrintNota(tx);

    this.isEditingExisting = false;
    const btnSave = document.getElementById('btn-save-transaction');
    if (btnSave) btnSave.textContent = 'Simpan Transaksi';

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) draftMsg.textContent = `Transaksi ${tx.docNo} tersimpan rapi.`;

    return true;
  },

  loadForEdit(tx) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.canEditTransaction()) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk mengubah data transaksi!', 'warning');
      return;
    }

    this.isEditingExisting = true;
    this.activeTxId = tx.id;
    this.activeDocNo = tx.docNo;

    const docNoInput = document.getElementById('input-doc-no');
    if (docNoInput) docNoInput.value = tx.docNo;

    const docDateInput = document.getElementById('input-doc-date');
    if (docDateInput) docDateInput.value = tx.date;

    const timeInInput = document.getElementById('input-time-in');
    if (timeInInput) timeInInput.value = tx.timeIn || '';

    const timeOutInput = document.getElementById('input-time-out');
    if (timeOutInput) timeOutInput.value = tx.timeOut || '';

    const plateNoInput = document.getElementById('input-plate-no');
    if (plateNoInput) plateNoInput.value = tx.plateNo || '';

    const supplierInput = document.getElementById('input-supplier');
    if (supplierInput) supplierInput.value = tx.supplier || '';

    const materialSelect = document.getElementById('select-material');
    if (materialSelect) materialSelect.value = tx.material || 'Garam Karung';

    const bagCountInput = document.getElementById('input-bag-count');
    if (bagCountInput) bagCountInput.value = tx.bagCount || 0;
    
    const regionSelect = document.getElementById('select-origin-region');
    if (regionSelect) regionSelect.value = tx.originRegion || 'Pamekasan';
    this.updateAreaDropdown(tx.originArea || 'Majungan');

    const grossInput = document.getElementById('input-gross-weight');
    if (grossInput) grossInput.value = tx.grossWeight || 0;

    const tareInput = document.getElementById('input-tare-weight');
    if (tareInput) tareInput.value = tx.tareWeight || 0;

    const netLoadInput = document.getElementById('input-net-load');
    if (netLoadInput) netLoadInput.value = (tx.netLoadWeight || 0).toLocaleString('id-ID');

    const refPercentInput = document.getElementById('input-refraction-percent');
    if (refPercentInput) refPercentInput.value = tx.refractionPercent || 0;

    const refKgInput = document.getElementById('input-refraction-kg');
    if (refKgInput) refKgInput.value = (tx.refractionKg || 0).toLocaleString('id-ID');

    const finalNetInput = document.getElementById('input-final-net');
    if (finalNetInput) finalNetInput.value = (tx.finalNetWeight || 0).toLocaleString('id-ID');

    const k1WeightInput = document.getElementById('input-k1-weight');
    if (k1WeightInput) k1WeightInput.value = tx.k1Weight || 0;

    const k2WeightInput = document.getElementById('input-k2-weight');
    if (k2WeightInput) k2WeightInput.value = tx.k2Weight || 0;

    const k1PriceInput = document.getElementById('input-k1-price');
    if (k1PriceInput) k1PriceInput.value = tx.k1Price || 0;

    const k2PriceInput = document.getElementById('input-k2-price');
    if (k2PriceInput) k2PriceInput.value = tx.k2Price || 0;

    const k1TotalInput = document.getElementById('input-k1-total');
    if (k1TotalInput) k1TotalInput.value = 'Rp ' + (tx.k1Total || 0).toLocaleString('id-ID');

    const k2TotalInput = document.getElementById('input-k2-total');
    if (k2TotalInput) k2TotalInput.value = 'Rp ' + (tx.k2Total || 0).toLocaleString('id-ID');

    const grandTotalDisplay = document.getElementById('display-grand-total');
    if (grandTotalDisplay) grandTotalDisplay.textContent = 'Rp ' + (tx.grandTotal || 0).toLocaleString('id-ID');

    const driverNameInput = document.getElementById('input-driver-name');
    if (driverNameInput) driverNameInput.value = tx.driverName || '';

    const weighmasterInput = document.getElementById('input-weighmaster');
    if (weighmasterInput) weighmasterInput.value = tx.weighmasterName || '';

    const adminNameInput = document.getElementById('input-admin-name');
    if (adminNameInput) adminNameInput.value = tx.adminName || '';

    const paymentStatusSelect = document.getElementById('select-payment-status');
    if (paymentStatusSelect) paymentStatusSelect.value = tx.paymentStatus || 'Lunas';

    const notesInput = document.getElementById('input-notes');
    if (notesInput) notesInput.value = tx.notes || '';

    const btnSave = document.getElementById('btn-save-transaction');
    if (btnSave) btnSave.textContent = 'Simpan Perubahan';

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) draftMsg.innerHTML = `<span style="color: #38BDF8; font-weight: 600;">Mode Edit Dokumen: ${tx.docNo}</span> (Ubah atribut data di bawah, lalu klik <strong>Simpan Perubahan</strong>)`;

    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.syncAll();
    }

    // Switch view to transaction tab
    App.switchTab('nota-timbang');
    App.showToast(`Memuat data transaksi ${tx.docNo} untuk disunting`, 'info');
  },

  generateNotaHtml(tx, copyNumber = 1, totalCopies = 1) {
    let copyBadgeText = 'NOTA TIMBANG';
    let copyReceiverText = 'LEMBAR UTAMA (ASLI)';
    let copyFooterText = '* Dokumen ini merupakan bukti sah penerimaan & penimbangan garam PT. Reka Cipta Garam.';

    if (totalCopies === 2) {
      if (copyNumber === 1) {
        copyBadgeText = 'NOTA TIMBANG (ASLI)';
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
        copyFooterText = '* Lembar 1: Untuk Pemasok / Supir sebagai bukti penerimaan.';
      } else {
        copyBadgeText = 'NOTA TIMBANG (ARSIP)';
        copyReceiverText = 'LEMBAR 2: ARSIP KANTOR / KEUANGAN';
        copyFooterText = '* Lembar 2: Untuk Arsip Kantor & Pembukuan Keuangan PT. RCG.';
      }
    } else if (totalCopies === 3) {
      if (copyNumber === 1) {
        copyBadgeText = 'NOTA TIMBANG (LEMBAR 1)';
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
        copyFooterText = '* Lembar 1: Untuk Pemasok / Supir sebagai bukti penerimaan.';
      } else if (copyNumber === 2) {
        copyBadgeText = 'NOTA TIMBANG (LEMBAR 2)';
        copyReceiverText = 'LEMBAR 2: BAGIAN TIMBANG & OPERASIONAL';
        copyFooterText = '* Lembar 2: Untuk Arsip Bagian Timbangan & Lapangan.';
      } else {
        copyBadgeText = 'NOTA TIMBANG (LEMBAR 3)';
        copyReceiverText = 'LEMBAR 3: KASIR & KEUANGAN';
        copyFooterText = '* Lembar 3: Untuk Kasir & Verifikasi Pembayaran.';
      }
    }

    const isLunas = (tx.paymentStatus === 'Lunas');
    const payStatusText = isLunas ? 'Lunas' : 'Belum Lunas';

    return `
      <div class="nota-container" style="background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 18px 20px; border: none !important; outline: none !important; box-shadow: none !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'}; box-sizing: border-box; width: 100%;">
        <!-- Header Perusahaan (Identik dengan Kop Formulir) -->
        <div class="nota-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #163A5F; padding-bottom: 10px; margin-bottom: 12px; gap: 12px;">
          <div style="display: flex; align-items: center; flex: 1; min-width: 0;">
            <img src="assets/images/kop surat nota timbang.webp" alt="PT Reka Cipta Garam - Subsidiary Bawang Mas Grup" style="height: 52px; max-height: 52px; max-width: 320px; width: auto; object-fit: contain; display: block;">
          </div>
          <div class="nota-title-box" style="text-align: right; flex-shrink: 0; white-space: nowrap; margin-left: auto;">
            <div style="font-size: 12px; font-weight: 700; color: #92400E; background: #FEF3C7; padding: 4px 10px; border-radius: 4px; display: inline-block; white-space: nowrap; letter-spacing: 0.02em;">${copyBadgeText}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #163A5F; margin-top: 3px; letter-spacing: 0.02em; white-space: nowrap;">[ ${copyReceiverText} ]</div>
            <div class="nota-doc-no" style="font-size: 10.5px; font-family: 'Plus Jakarta Sans', monospace; color: #64748B; margin-top: 2px; white-space: nowrap;">No: <span style="font-weight: 700; color: #0F172A;">${tx.docNo}</span></div>
          </div>
        </div>

        <div class="nota-grid" style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; margin-bottom: 12px; font-size: 11px; background: #F8FAFC; padding: 8px 12px; border-radius: 4px; border: none;">
          <table class="nota-info-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="label" style="width: 68px; color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">Tanggal</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="font-weight: 700; font-family: 'Plus Jakarta Sans', monospace; color: #0F172A; padding: 2px 0; white-space: nowrap;">${tx.date} <span style="font-weight: 500; font-size: 10px; color: #64748B;">(${tx.timeIn || '-'} - ${tx.timeOut || '-'})</span></td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">No. Polisi</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="font-weight: 700; font-family: 'Plus Jakarta Sans', monospace; color: #0F172A; padding: 2px 0; white-space: nowrap;">${tx.plateNo}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">Pemasok</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="font-weight: 700; color: #0F172A; padding: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${tx.supplier}</td>
            </tr>
          </table>

          <table class="nota-info-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="label" style="width: 72px; color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">Material</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="font-weight: 700; color: #0F172A; padding: 2px 0; white-space: nowrap;">${tx.material} ${tx.bagCount ? '<span style="font-weight: normal; font-size: 10px; color: #64748B;">(' + tx.bagCount + ' Karung)</span>' : ''}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">Asal Garam</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="color: #0F172A; padding: 2px 0; white-space: nowrap;">${tx.originArea || '-'}, ${tx.originRegion || '-'}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 2px 0; white-space: nowrap; font-weight: 500;">Status Bayar</td>
              <td class="colon" style="width: 10px; text-align: center; color: #64748B; font-weight: 500; padding: 2px 0;">:</td>
              <td class="val" style="padding: 2px 0; white-space: nowrap;"><strong style="color: ${isLunas ? '#16A34A' : '#D97706'};">${payStatusText}</strong></td>
            </tr>
          </table>
        </div>

        <table class="nota-weight-table" style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; border: none;">
          <thead>
            <tr style="background: #163A5F; color: #FFFFFF;">
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Kotor (Gross)</th>
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Tara (Tare)</th>
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Muatan (Bruto)</th>
              <th style="padding: 5px 6px; text-align: center; border: none; font-size: 10px; white-space: nowrap;">Refraksi (%)</th>
              <th style="padding: 5px 6px; text-align: right; background: #0F2844; border: none; font-size: 10px; white-space: nowrap;">BERSIH TOTAL (Kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">${tx.grossWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">${tx.tareWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">${tx.netLoadWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 5px 6px; text-align: center; font-family: monospace; border: none; white-space: nowrap;">${tx.refractionPercent}%</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: 800; background: #EEF2F6; color: #163A5F; border: none; white-space: nowrap;">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</td>
            </tr>
          </tbody>
        </table>

        <table class="nota-weight-table" style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; border: none;">
          <thead>
            <tr style="background: #163A5F; color: #FFFFFF;">
              <th style="padding: 5px 6px; text-align: left; border: none; font-size: 10px; white-space: nowrap;">Kategori Mutu</th>
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Berat (Kg)</th>
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Harga Satuan (Rp/Kg)</th>
              <th style="padding: 5px 6px; text-align: right; border: none; font-size: 10px; white-space: nowrap;">Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 5px 6px; border: none; white-space: nowrap;"><strong>Garam K1</strong></td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">${tx.k1Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">Rp ${tx.k1Price.toLocaleString('id-ID')}</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: 700; color: #163A5F; border: none; white-space: nowrap;">Rp ${tx.k1Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 5px 6px; border: none; white-space: nowrap;"><strong>Garam K2</strong></td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">${tx.k2Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; border: none; white-space: nowrap;">Rp ${tx.k2Price.toLocaleString('id-ID')}</td>
              <td class="num" style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: 700; color: #B45309; border: none; white-space: nowrap;">Rp ${tx.k2Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr style="background: #EEF2F6; font-weight: 800;">
              <td colspan="3" style="padding: 7px 8px; text-align: right; font-size: 11px; border: none; white-space: nowrap;">TOTAL PEMBAYARAN:</td>
              <td class="num" style="padding: 7px 8px; text-align: right; font-size: 12.5px; font-family: monospace; color: #163A5F; border: none; white-space: nowrap;">Rp ${tx.grandTotal.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div class="nota-signatures" style="display: grid; grid-template-columns: repeat(2, 1fr); text-align: center; margin-top: 14px; font-size: 11px;">
          <div class="sign-col" style="text-align: center;">
            <p style="color: #64748B; margin: 0 0 36px 0;">Supir Kendaraan</p>
            <div class="sign-name" style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 130px; padding-top: 3px; font-size: 10.5px;">( ${tx.driverName || 'Supir'} )</div>
          </div>
          <div class="sign-col" style="text-align: center;">
            <p style="color: #64748B; margin: 0 0 36px 0;">Admin</p>
            <div class="sign-name" style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 130px; padding-top: 3px; font-size: 10.5px;">( ${tx.weighmasterName || tx.adminName || 'Admin'} )</div>
          </div>
        </div>

        <div class="nota-footer-note" style="font-size: 9px; color: #64748B; text-align: center; margin-top: 10px; border-top: 1px dashed #CBD5E1; padding-top: 4px;">
          ${copyFooterText}
        </div>
      </div>
    `;
  },

  printCurrentNota() {
    const tx = this.getCurrentFormData();
    const generatorFn = (copyNumber, totalCopies) => this.generateNotaHtml(tx, copyNumber, totalCopies);

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog('Pratinjau Cetak Nota Timbang', generatorFn, tx.docNo, 'Nota_Timbang');
    } else {
      const container = document.getElementById('printable-nota');
      if (container) container.innerHTML = generatorFn(1, 1);
      window.print();
    }
  }
};
