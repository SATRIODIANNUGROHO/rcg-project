/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Transaction Logic & Calculations (Nota Timbang Engine)
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

    const today = new Date().toISOString().slice(0, 10);
    const settings = StorageManager.getSettings();
    const currentUser = AuthManager.getCurrentUser();

    // Form inputs reset
    document.getElementById('input-doc-no').value = this.activeDocNo;
    document.getElementById('input-doc-date').value = today;
    document.getElementById('input-time-in').value = '';
    document.getElementById('input-time-out').value = '';
    document.getElementById('input-plate-no').value = '';
    document.getElementById('input-supplier').value = '';
    document.getElementById('select-material').value = 'Garam Karung Super';
    document.getElementById('input-bag-count').value = '180';
    document.getElementById('select-origin-region').value = 'Pamekasan';
    this.updateAreaDropdown('Majungan');

    document.getElementById('input-gross-weight').value = '0';
    document.getElementById('input-tare-weight').value = '0';
    document.getElementById('input-net-load').value = '0';
    document.getElementById('input-refraction-percent').value = settings.defaultRefraction || 5.0;
    document.getElementById('input-refraction-kg').value = '0';
    document.getElementById('input-final-net').value = '0';

    document.getElementById('input-k1-weight').value = '0';
    document.getElementById('input-k2-weight').value = '0';
    document.getElementById('input-k1-price').value = settings.defaultK1Price || 1250;
    document.getElementById('input-k2-price').value = settings.defaultK2Price || 1050;
    document.getElementById('input-k1-total').value = '0';
    document.getElementById('input-k2-total').value = '0';

    document.getElementById('display-grand-total').textContent = 'Rp 0';
    document.getElementById('input-driver-name').value = '';
    document.getElementById('input-weighmaster').value = settings.defaultWeighmaster || 'AFIF';
    document.getElementById('input-admin-name').value = currentUser.username || 'admin';
    document.getElementById('select-payment-status').value = 'Lunas';
    document.getElementById('input-notes').value = '';

    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.syncAll();
    }

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) draftMsg.textContent = 'Draf penimbangan baru siap digunakan.';
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

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) draftMsg.textContent = `Transaksi ${tx.docNo} tersimpan rapi.`;

    return true;
  },

  loadForEdit(tx) {
    this.isEditingExisting = true;
    this.activeTxId = tx.id;
    this.activeDocNo = tx.docNo;

    document.getElementById('input-doc-no').value = tx.docNo;
    document.getElementById('input-doc-date').value = tx.date;
    document.getElementById('input-time-in').value = tx.timeIn || '';
    document.getElementById('input-time-out').value = tx.timeOut || '';
    document.getElementById('input-plate-no').value = tx.plateNo;
    document.getElementById('input-supplier').value = tx.supplier;
    document.getElementById('select-material').value = tx.material;
    document.getElementById('input-bag-count').value = tx.bagCount || 0;
    
    document.getElementById('select-origin-region').value = tx.originRegion || 'Pamekasan';
    this.updateAreaDropdown(tx.originArea || 'Majungan');

    document.getElementById('input-gross-weight').value = tx.grossWeight;
    document.getElementById('input-tare-weight').value = tx.tareWeight;
    document.getElementById('input-net-load').value = (tx.netLoadWeight || 0).toLocaleString('id-ID');
    document.getElementById('input-refraction-percent').value = tx.refractionPercent;
    document.getElementById('input-refraction-kg').value = (tx.refractionKg || 0).toLocaleString('id-ID');
    document.getElementById('input-final-net').value = (tx.finalNetWeight || 0).toLocaleString('id-ID');

    document.getElementById('input-k1-weight').value = tx.k1Weight;
    document.getElementById('input-k2-weight').value = tx.k2Weight;
    document.getElementById('input-k1-price').value = tx.k1Price;
    document.getElementById('input-k2-price').value = tx.k2Price;
    document.getElementById('input-k1-total').value = 'Rp ' + (tx.k1Total || 0).toLocaleString('id-ID');
    document.getElementById('input-k2-total').value = 'Rp ' + (tx.k2Total || 0).toLocaleString('id-ID');
    document.getElementById('display-grand-total').textContent = 'Rp ' + (tx.grandTotal || 0).toLocaleString('id-ID');

    document.getElementById('input-driver-name').value = tx.driverName;
    document.getElementById('input-weighmaster').value = tx.weighmasterName;
    document.getElementById('input-admin-name').value = tx.adminName;
    document.getElementById('select-payment-status').value = tx.paymentStatus || 'Lunas';
    document.getElementById('input-notes').value = tx.notes || '';

    if (typeof CustomSelectManager !== 'undefined') {
      CustomSelectManager.syncAll();
    }

    // Switch view to transaction tab
    App.switchTab('nota-timbang');
    App.showToast(`Memuat data transaksi ${tx.docNo} untuk disunting`, 'info');
  },

  generateNotaHtml(tx, copyNumber = 1, totalCopies = 1) {
    let copyReceiverText = 'LEMBAR UTAMA (ASLI)';
    let copyFooterText = '* Dokumen ini merupakan bukti sah penerimaan & penimbangan garam PT. Reka Cipta Garam.';

    if (totalCopies === 2) {
      if (copyNumber === 1) {
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
        copyFooterText = '* Lembar 1: Untuk Pemasok / Supir sebagai bukti penerimaan.';
      } else {
        copyReceiverText = 'LEMBAR 2: ARSIP KANTOR / KEUANGAN';
        copyFooterText = '* Lembar 2: Untuk Arsip Kantor & Pembukuan Keuangan PT. RCG.';
      }
    } else if (totalCopies === 3) {
      if (copyNumber === 1) {
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
        copyFooterText = '* Lembar 1: Untuk Pemasok / Supir sebagai bukti penerimaan.';
      } else if (copyNumber === 2) {
        copyReceiverText = 'LEMBAR 2: BAGIAN TIMBANG & OPERASIONAL';
        copyFooterText = '* Lembar 2: Untuk Arsip Bagian Timbangan & Lapangan.';
      } else {
        copyReceiverText = 'LEMBAR 3: KASIR & KEUANGAN';
        copyFooterText = '* Lembar 3: Untuk Kasir & Verifikasi Pembayaran.';
      }
    }

    return `
      <div class="nota-container" style="background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 18px; border: none !important; box-shadow: none !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'};">
        <div class="nota-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #163A5F; padding-bottom: 8px; margin-bottom: 12px;">
          <div class="nota-company">
            <h2 style="font-size: 15px; font-weight: 800; color: #163A5F; margin: 0;">PT. REKA CIPTA GARAM</h2>
            <p style="font-size: 10px; color: #64748B; margin: 2px 0 0 0;">Kawasan Industri Garam Terpadu, Madura - Jawa Timur | Telp: (0324) 321888</p>
          </div>
          <div class="nota-title-box" style="text-align: right;">
            <h1 style="font-size: 14px; font-weight: 800; color: #0F172A; margin: 0;">NOTA TIMBANG</h1>
            <div style="font-size: 10px; font-weight: 700; color: #163A5F; margin-top: 2px;">[ ${copyReceiverText} ]</div>
            <div class="nota-doc-no" style="font-size: 10.5px; font-family: monospace; color: #64748B;">${tx.docNo}</div>
          </div>
        </div>

        <div class="nota-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 12px; font-size: 11.5px; background: #F8FAFC; padding: 10px 14px; border-radius: 4px; border: 1px solid #E2E8F0;">
          <table class="nota-info-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="label" style="width: 90px; color: #64748B; padding: 3px 0;">Tanggal</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="font-weight: 700; font-family: monospace; color: #0F172A; padding: 3px 0;">${tx.date} (${tx.timeIn || '-'} s/d ${tx.timeOut || '-'})</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 3px 0;">No. Polisi</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="font-weight: 700; font-family: monospace; color: #0F172A; padding: 3px 0;">${tx.plateNo}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 3px 0;">Pemasok</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="font-weight: 700; color: #0F172A; padding: 3px 0;">${tx.supplier}</td>
            </tr>
          </table>

          <table class="nota-info-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="label" style="width: 90px; color: #64748B; padding: 3px 0;">Material</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="font-weight: 700; color: #0F172A; padding: 3px 0;">${tx.material} ${tx.bagCount ? '(' + tx.bagCount + ' Karung)' : ''}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 3px 0;">Asal Garam</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="color: #0F172A; padding: 3px 0;">${tx.originArea || '-'}, ${tx.originRegion || '-'}</td>
            </tr>
            <tr>
              <td class="label" style="color: #64748B; padding: 3px 0;">Status Bayar</td>
              <td class="colon" style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
              <td class="val" style="padding: 3px 0;"><strong style="color: ${tx.paymentStatus === 'Lunas' ? '#16A34A' : '#D97706'};">${tx.paymentStatus}</strong></td>
            </tr>
          </table>
        </div>

        <table class="nota-weight-table" style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #CBD5E1; font-size: 11.5px;">
          <thead>
            <tr style="background: #163A5F; color: #FFFFFF;">
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Kotor (Gross)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Tara (Tare)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Muatan (Bruto)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: center;">Refraksi (%)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Potongan (Kg)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right; background: #0F2844;">BERSIH TOTAL (Kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.grossWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.tareWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.netLoadWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: center; font-family: monospace;">${tx.refractionPercent}%</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.refractionKg.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: right; font-family: monospace; font-weight: 800; background: #EEF2F6; color: #163A5F;">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</td>
            </tr>
          </tbody>
        </table>

        <table class="nota-weight-table" style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #CBD5E1; font-size: 11.5px;">
          <thead>
            <tr style="background: #163A5F; color: #FFFFFF;">
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: left;">Kategori Mutu</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Berat (Kg)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Harga Satuan (Rp/Kg)</th>
              <th style="padding: 6px 8px; border: 1px solid #163A5F; text-align: right;">Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #E2E8F0;"><strong>K1 (Garam Super / Putih)</strong></td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.k1Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">Rp ${tx.k1Price.toLocaleString('id-ID')}</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace; font-weight: 700; color: #163A5F;">Rp ${tx.k1Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr style="background: #F8FAFC;">
              <td style="padding: 6px 8px; border: 1px solid #E2E8F0;"><strong>K2 (Garam Standar)</strong></td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">${tx.k2Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace;">Rp ${tx.k2Price.toLocaleString('id-ID')}</td>
              <td class="num" style="padding: 6px 8px; border: 1px solid #E2E8F0; text-align: right; font-family: monospace; font-weight: 700; color: #B45309;">Rp ${tx.k2Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr style="background: #EEF2F6; font-weight: 800;">
              <td colspan="3" style="padding: 8px 10px; text-align: right; border: 1px solid #CBD5E1; font-size: 12px;">TOTAL PEMBAYARAN:</td>
              <td class="num" style="padding: 8px 10px; text-align: right; border: 1px solid #CBD5E1; font-size: 13px; font-family: monospace; color: #163A5F;">Rp ${tx.grandTotal.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div class="nota-signatures" style="display: grid; grid-template-columns: repeat(2, 1fr); text-align: center; margin-top: 18px; font-size: 11px;">
          <div class="sign-col" style="text-align: center;">
            <p style="color: #64748B; margin: 0 0 42px 0;">Supir Kendaraan</p>
            <div class="sign-name" style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 140px; padding-top: 4px;">( ${tx.driverName || 'Supir'} )</div>
          </div>
          <div class="sign-col" style="text-align: center;">
            <p style="color: #64748B; margin: 0 0 42px 0;">Admin</p>
            <div class="sign-name" style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 140px; padding-top: 4px;">( ${tx.weighmasterName || tx.adminName || 'Admin'} )</div>
          </div>
        </div>

        <div class="nota-footer-note" style="font-size: 9.5px; color: #64748B; text-align: center; margin-top: 12px; border-top: 1px dashed #CBD5E1; padding-top: 4px;">
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
