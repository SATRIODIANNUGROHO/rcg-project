/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Excel Report Generation & AutoFilter, Suffix Formatting & AutoSum Formulas
 */

const ExportExcelManager = {
  activeContext: 'transaction',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const scopeRadios = document.querySelectorAll('input[name="export-scope-option"]');
    scopeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        const singleDateWrap = document.getElementById('export-single-date-wrap');
        const rangeDateWrap = document.getElementById('export-range-date-wrap');

        if (singleDateWrap) singleDateWrap.style.display = (val === 'date') ? 'block' : 'none';
        if (rangeDateWrap) rangeDateWrap.style.display = (val === 'range') ? 'flex' : 'none';
      });
    });

    const btnConfirmExport = document.getElementById('btn-confirm-export-excel');
    if (btnConfirmExport) {
      btnConfirmExport.addEventListener('click', () => {
        this.executeExport();
        App.closeModal('modal-export-excel');
      });
    }
  },

  openExportDialog(context = 'transaction') {
    this.activeContext = context;
    const titleEl = document.getElementById('export-modal-title');
    if (titleEl) {
      titleEl.textContent = context === 'supplier'
        ? 'Export Excel Rekapitulasi Pemasok / Supplier'
        : 'Export Excel Riwayat Transaksi Penimbangan';
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const dateSingle = document.getElementById('export-input-single-date');
    if (dateSingle && !dateSingle.value) dateSingle.value = todayStr;

    const dateStart = document.getElementById('export-input-range-start');
    const dateEnd = document.getElementById('export-input-range-end');
    if (dateStart && !dateStart.value) dateStart.value = todayStr;
    if (dateEnd && !dateEnd.value) dateEnd.value = todayStr;

    App.openModal('modal-export-excel');
  },

  getScopedData() {
    let txs = StorageManager.getTransactions();
    const scopeEl = document.querySelector('input[name="export-scope-option"]:checked');
    const scope = scopeEl ? scopeEl.value : 'all';
    const todayStr = new Date().toISOString().slice(0, 10);

    if (scope === 'today') {
      txs = txs.filter(t => t.date === todayStr);
    } else if (scope === 'date') {
      const targetDate = document.getElementById('export-input-single-date')?.value || todayStr;
      txs = txs.filter(t => t.date === targetDate);
    } else if (scope === 'range') {
      const start = document.getElementById('export-input-range-start')?.value || '2020-01-01';
      const end = document.getElementById('export-input-range-end')?.value || '2099-12-31';
      txs = txs.filter(t => t.date >= start && t.date <= end);
    }

    return txs;
  },

  executeExport() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS belum dimuat!', 'danger');
      return;
    }

    const txs = this.getScopedData();
    if (txs.length === 0) {
      App.showToast('Tidak ada data yang sesuai dengan cakupan tanggal yang dipilih.', 'warning');
      return;
    }

    if (this.activeContext === 'supplier') {
      this.exportSupplierExcel(txs);
    } else {
      this.exportTransactionExcel(txs);
    }
  },

  exportTransactionExcel(txs) {
    const rows = [];
    const headers = [
      'No', 'No. Dokumen', 'Tanggal', 'Waktu Masuk', 'Waktu Keluar',
      'Nama Pemasok', 'Kabupaten Asal', 'Desa Asal', 'No. Polisi', 'Nama Supir',
      'Jenis Material', 'Jumlah', 'Kotor (Kg)', 'Tara (Kg)', 'Muatan (Kg)',
      'Refraksi (%)', 'Potongan Refr. (Kg)', 'Bersih Total (Kg)',
      'Berat K1 (Kg)', 'Harga K1 (Rp)', 'Subtotal K1 (Rp)',
      'Berat K2 (Kg)', 'Harga K2 (Rp)', 'Subtotal K2 (Rp)',
      'Grand Total (Rp)', 'Status Pembayaran', 'Petugas Timbang'
    ];

    rows.push(headers);

    txs.forEach((t, i) => {
      const isKarung = (t.material || '').toLowerCase().includes('karung');
      const jumlahFormatted = isKarung
        ? `${t.bagCount || 0} karung`
        : `${(t.finalNetWeight || 0).toLocaleString('id-ID')} kg`;

      rows.push([
        i + 1,
        t.docNo || '',
        t.date || '',
        t.timeIn || '-',
        t.timeOut || '-',
        t.supplier || '',
        t.originRegion || '-',
        t.originArea || '-',
        t.plateNo || '',
        t.driverName || '-',
        t.material || '',
        jumlahFormatted,
        t.grossWeight || 0,
        t.tareWeight || 0,
        t.netLoadWeight || 0,
        `${t.refractionPercent || 0}%`,
        t.refractionKg || 0,
        t.finalNetWeight || 0,
        t.k1Weight || 0,
        t.k1Price || 0,
        t.k1Total || 0,
        t.k2Weight || 0,
        t.k2Price || 0,
        t.k2Total || 0,
        t.grandTotal || 0,
        t.paymentStatus || 'Belum Lunas',
        t.weighmasterName || '-'
      ]);
    });

    const lastDataRow = rows.length;
    // AutoSum Total Row
    rows.push([
      'TOTAL', '', '', '', '', '', '', '', '', '', '', '',
      { f: `SUM(M2:M${lastDataRow})` }, // Kotor
      { f: `SUM(N2:N${lastDataRow})` }, // Tara
      { f: `SUM(O2:O${lastDataRow})` }, // Muatan
      '',
      { f: `SUM(Q2:Q${lastDataRow})` }, // Potongan Refr
      { f: `SUM(R2:R${lastDataRow})` }, // Bersih Total
      { f: `SUM(S2:S${lastDataRow})` }, // K1 Weight
      '',
      { f: `SUM(U2:U${lastDataRow})` }, // Subtotal K1
      { f: `SUM(V2:V${lastDataRow})` }, // K2 Weight
      '',
      { f: `SUM(X2:X${lastDataRow})` }, // Subtotal K2
      { f: `SUM(Y2:Y${lastDataRow})` }, // Grand Total
      '', ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!autofilter'] = { ref: `A1:AA${lastDataRow}` };

    // Set column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
      { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 },
      { wch: 16 }, { wch: 16 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Penimbangan');

    const fileName = `PT_RCG_Riwayat_Timbang_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    App.showToast(`Berhasil mengekspor ${txs.length} transaksi ke Excel!`, 'success');
  },

  exportSupplierExcel(txs) {
    const rows = [];
    const headers = [
      'No', 'Tanggal', 'No. Dokumen', 'Nama Pemasok', 'Kabupaten Asal', 'Desa Asal',
      'No. Polisi', 'Berat K1 (Kg)', 'Harga K1 (Rp)', 'Subtotal K1 (Rp)',
      'Berat K2 (Kg)', 'Harga K2 (Rp)', 'Subtotal K2 (Rp)',
      'Total Pembayaran (Rp)', 'Status Pembayaran'
    ];

    rows.push(headers);

    txs.forEach((t, i) => {
      rows.push([
        i + 1,
        t.date || '',
        t.docNo || '',
        t.supplier || '',
        t.originRegion || '-',
        t.originArea || '-',
        t.plateNo || '',
        t.k1Weight || 0,
        t.k1Price || 0,
        t.k1Total || 0,
        t.k2Weight || 0,
        t.k2Price || 0,
        t.k2Total || 0,
        t.grandTotal || 0,
        t.paymentStatus || 'Belum Lunas'
      ]);
    });

    const lastDataRow = rows.length;
    // AutoSum Total Row
    rows.push([
      'TOTAL', '', '', '', '', '', '',
      { f: `SUM(H2:H${lastDataRow})` }, // Berat K1
      '',
      { f: `SUM(J2:J${lastDataRow})` }, // Subtotal K1
      { f: `SUM(K2:K${lastDataRow})` }, // Berat K2
      '',
      { f: `SUM(M2:M${lastDataRow})` }, // Subtotal K2
      { f: `SUM(N2:N${lastDataRow})` }, // Grand Total
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!autofilter'] = { ref: `A1:O${lastDataRow}` };

    ws['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 16 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 16 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi Pemasok');

    const fileName = `PT_RCG_Rekap_Pemasok_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    App.showToast(`Berhasil mengekspor ${txs.length} data pemasok ke Excel!`, 'success');
  }
};
