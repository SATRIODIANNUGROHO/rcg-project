/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Transaction Logic & Calculations (Nota Timbang Engine)
 */

const TransactionEngine = {
  activeTxId: null,
  activeDocNo: '',
  isEditingExisting: false,

  // Hierarchy Data for Salt Origin
  originHierarchy: {
    'Pamekasan': ['Majungan', 'Pademawu', 'Galis', 'Tlanakan', 'Larangan'],
    'Sumenep': ['Kalianget', 'Saronggi', 'Gapura', 'Dungkek', 'Pragaan'],
    'Sampang': ['Camplong', 'Sreseh', 'Torjun', 'Pangarengan'],
    'Gresik': ['Manyar', 'Ujungpangkah', 'Bungah']
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

  preparePrintNota(tx) {
    const printContainer = document.getElementById('printable-nota');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div class="nota-container">
        <div class="nota-header">
          <div class="nota-company">
            <h2>PT. REKA CIPTA GARAM</h2>
            <p>Kawasan Industri Garam Terpadu, Madura - Jawa Timur | Telp: (0324) 321888</p>
          </div>
          <div class="nota-title-box">
            <h1>NOTA TIMBANG</h1>
            <div class="nota-doc-no">${tx.docNo}</div>
          </div>
        </div>

        <div class="nota-grid">
          <table class="nota-info-table">
            <tr>
              <td class="label">Tanggal</td>
              <td class="colon">:</td>
              <td class="val">${tx.date} (${tx.timeIn || '-'} s/d ${tx.timeOut || '-'})</td>
            </tr>
            <tr>
              <td class="label">No. Polisi</td>
              <td class="colon">:</td>
              <td class="val">${tx.plateNo}</td>
            </tr>
            <tr>
              <td class="label">Pemasok</td>
              <td class="colon">:</td>
              <td class="val">${tx.supplier}</td>
            </tr>
          </table>

          <table class="nota-info-table">
            <tr>
              <td class="label">Material</td>
              <td class="colon">:</td>
              <td class="val">${tx.material} ${tx.bagCount ? '(' + tx.bagCount + ' Karung)' : ''}</td>
            </tr>
            <tr>
              <td class="label">Asal Garam</td>
              <td class="colon">:</td>
              <td class="val">${tx.originArea}, ${tx.originRegion}</td>
            </tr>
            <tr>
              <td class="label">Status Bayar</td>
              <td class="colon">:</td>
              <td class="val">${tx.paymentStatus}</td>
            </tr>
          </table>
        </div>

        <table class="nota-weight-table">
          <thead>
            <tr>
              <th>Berat Kotor (Gross)</th>
              <th>Berat Tara (Tare)</th>
              <th>Muatan (Bruto)</th>
              <th>Refraksi (%)</th>
              <th>Potongan (Kg)</th>
              <th>BERSIH TOTAL (Kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="num">${tx.grossWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num">${tx.tareWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num">${tx.netLoadWeight.toLocaleString('id-ID')} Kg</td>
              <td class="num" style="text-align:center;">${tx.refractionPercent}%</td>
              <td class="num">${tx.refractionKg.toLocaleString('id-ID')} Kg</td>
              <td class="num nota-total-highlight">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</td>
            </tr>
          </tbody>
        </table>

        <table class="nota-weight-table">
          <thead>
            <tr>
              <th>Kategori Mutu</th>
              <th>Berat (Kg)</th>
              <th>Harga Satuan (Rp/Kg)</th>
              <th>Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>K1 (Garam Super / Putih)</strong></td>
              <td class="num">${tx.k1Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num">Rp ${tx.k1Price.toLocaleString('id-ID')}</td>
              <td class="num">Rp ${tx.k1Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td><strong>K2 (Garam Standar)</strong></td>
              <td class="num">${tx.k2Weight.toLocaleString('id-ID')} Kg</td>
              <td class="num">Rp ${tx.k2Price.toLocaleString('id-ID')}</td>
              <td class="num">Rp ${tx.k2Total.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="nota-total-highlight">
              <td colspan="3" style="text-align: right; font-weight: 800; font-size: 11pt;">TOTAL PEMBAYARAN:</td>
              <td class="num" style="font-size: 11pt; color: #000000;">Rp ${tx.grandTotal.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div class="nota-signatures">
          <div class="sign-col">
            <p>Supir Kendaraan</p>
            <div class="sign-name">( ${tx.driverName} )</div>
          </div>
          <div class="sign-col">
            <p>Petugas Timbang</p>
            <div class="sign-name">( ${tx.weighmasterName} )</div>
          </div>
          <div class="sign-col">
            <p>Mengetahui / Admin</p>
            <div class="sign-name">( ${tx.adminName} )</div>
          </div>
        </div>

        <div class="nota-footer-note">
          * Dokumen ini merupakan bukti sah penerimaan & penimbangan garam PT. Reka Cipta Garam. Dicetak otomatis pada: ${new Date().toLocaleString('id-ID')}.
        </div>
      </div>
    `;
  },

  printCurrentNota() {
    const tx = this.getCurrentFormData();
    this.preparePrintNota(tx);

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog(() => {
        if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
          window.electronAPI.printNota();
        } else {
          window.print();
        }
      });
    } else {
      if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
        window.electronAPI.printNota();
      } else {
        window.print();
      }
    }
  }
};
