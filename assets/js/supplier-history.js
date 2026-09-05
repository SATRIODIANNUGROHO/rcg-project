/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Riwayat Pemasok / Supplier & Cetak Form Supplier
 * Handles supplier transaction log, filtering, supplier-specific rekap, and Excel export
 */

const SupplierHistoryManager = {
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  selectedSupplier: '',
  selectedDate: '',
  sortOrder: 'desc',
  combobox: null,

  init() {
    this.bindEvents();
    this.initCombobox();
    this.render();
  },

  initCombobox() {
    if (typeof CustomAutocomplete !== 'undefined' && CustomAutocomplete.createSupplierCombobox) {
      this.combobox = CustomAutocomplete.createSupplierCombobox({
        containerId: 'supplier-history-combobox',
        inputId: 'supplier-history-supplier-input',
        chevronBtnId: 'supplier-history-combobox-btn',
        menuId: 'supplier-history-combobox-menu',
        placeholder: 'Semua Pemasok',
        initialValue: this.selectedSupplier || '',
        onSelect: (supplier) => {
          this.selectedSupplier = supplier || '';
          this.currentPage = 1;
          this.render();
        },
        onInput: (val) => {
          if (!val || val.toLowerCase() === 'semua pemasok') {
            this.selectedSupplier = '';
          } else {
            this.selectedSupplier = val;
          }
          this.currentPage = 1;
          this.render();
        }
      });
    }
  },

  bindEvents() {
    const searchInput = document.getElementById('supplier-history-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.render();
      });
    }

    const resetBtn = document.getElementById('supplier-history-reset-search');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.selectedSupplier = '';
        this.selectedDate = '';
        if (searchInput) searchInput.value = '';
        if (this.combobox) {
          this.combobox.setValue('');
        } else {
          const suppInput = document.getElementById('supplier-history-supplier-input');
          if (suppInput) suppInput.value = '';
        }
        const dateInput = document.getElementById('supplier-history-date-filter');
        if (dateInput) dateInput.value = '';
        this.currentPage = 1;
        this.render();
      });
    }

    const dateFilter = document.getElementById('supplier-history-date-filter');
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const sortSelect = document.getElementById('supplier-history-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOrder = e.target.value;
        this.render();
      });
    }

    const pageSizeSelect = document.getElementById('supplier-history-page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10) || 10;
        this.currentPage = 1;
        this.render();
      });
    }

    const prevBtn = document.getElementById('supplier-history-prev-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });
    }

    const nextBtn = document.getElementById('supplier-history-next-page');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.render();
      });
    }

    const btnExport = document.getElementById('btn-export-supplier-excel');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        if (typeof ExportExcelManager !== 'undefined') {
          ExportExcelManager.openExportDialog('supplier');
        } else {
          this.exportDirectExcel();
        }
      });
    }
  },

  getFilteredData() {
    let txs = StorageManager.getTransactions();

    if (this.searchQuery) {
      const q = this.searchQuery;
      txs = txs.filter(t =>
        (t.docNo && t.docNo.toLowerCase().includes(q)) ||
        (t.supplier && t.supplier.toLowerCase().includes(q)) ||
        (t.material && t.material.toLowerCase().includes(q)) ||
        (t.plateNo && t.plateNo.toLowerCase().includes(q)) ||
        (t.originArea && t.originArea.toLowerCase().includes(q)) ||
        (t.originRegion && t.originRegion.toLowerCase().includes(q))
      );
    }

    if (this.selectedSupplier) {
      const target = this.selectedSupplier.toLowerCase().trim();
      txs = txs.filter(t => (t.supplier || '').toLowerCase().includes(target));
    }

    if (this.selectedDate) {
      txs = txs.filter(t => t.date === this.selectedDate);
    }

    txs.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.timeIn || '00:00')).getTime();
      const dateB = new Date(b.date + ' ' + (b.timeIn || '00:00')).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return txs;
  },

  render() {
    if (this.combobox) {
      this.combobox.refresh();
    }
    const tbody = document.getElementById('supplier-history-table-body');
    if (!tbody) return;

    const filtered = this.getFilteredData();
    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paginated = filtered.slice(startIdx, startIdx + this.pageSize);

    const indicator = document.getElementById('supplier-history-page-indicator');
    if (indicator) {
      indicator.textContent = `Halaman ${this.currentPage} / ${totalPages} (${filtered.length} Data Pemasok)`;
    }

    const prevBtn = document.getElementById('supplier-history-prev-page');
    const nextBtn = document.getElementById('supplier-history-next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

    tbody.innerHTML = '';

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 32px; color: var(--text-secondary);">
            <strong>Tidak ada data pemasok yang sesuai kriteria filter</strong>
            <p style="font-size: 12px; margin-top: 4px;">Coba atur ulang filter pencarian atau tanggal.</p>
          </td>
        </tr>
      `;
      return;
    }

    paginated.forEach((tx) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="mono-num">${tx.date}</td>
        <td>
          <strong>${tx.supplier}</strong>
          <div class="text-small text-secondary mono-num">${tx.docNo}</div>
        </td>
        <td class="num-cell" style="color: var(--primary); font-weight: 600;">${(tx.k1Weight || 0).toLocaleString('id-ID')} Kg</td>
        <td class="num-cell" style="color: var(--accent-gold); font-weight: 600;">${(tx.k2Weight || 0).toLocaleString('id-ID')} Kg</td>
        <td class="num-cell mono-num">Rp ${(tx.k1Price || 0).toLocaleString('id-ID')}</td>
        <td class="num-cell mono-num">Rp ${(tx.k2Price || 0).toLocaleString('id-ID')}</td>
        <td class="num-cell mono-num" style="color: var(--primary);">Rp ${(tx.k1Total || 0).toLocaleString('id-ID')}</td>
        <td class="num-cell mono-num" style="color: var(--accent-gold);">Rp ${(tx.k2Total || 0).toLocaleString('id-ID')}</td>
        <td class="num-cell mono-num" style="font-weight: 700; color: var(--primary-dark);">Rp ${(tx.grandTotal || 0).toLocaleString('id-ID')}</td>
        <td class="text-center" style="white-space: nowrap;">
          <button class="btn btn-table-action action-print" style="padding: 4px 10px; font-weight: 600;" title="Cetak Form Pemasok" onclick="SupplierHistoryManager.printSupplierForm('${tx.id}')">
            Cetak Form
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  printSupplierForm(txId) {
    const txs = StorageManager.getTransactions();
    const tx = txs.find(t => t.id === txId);
    if (!tx) return;

    const generatorFn = (copyNumber, totalCopies) => {
      let copyBadgeText = 'FORM PEMASOK GARAM';
      let copyReceiverText = 'LEMBAR UTAMA (ASLI)';
      let copyFooterText = '* Dokumen ini merupakan bukti sah penerimaan & penimbangan garam PT. Reka Cipta Garam.';

      if (totalCopies === 2) {
        if (copyNumber === 1) {
          copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
          copyFooterText = '* Lembar 1: Untuk Pemasok / Pengemudi sebagai bukti penyerahan garam.';
        } else {
          copyReceiverText = 'LEMBAR 2: ARSIP KANTOR / KEUANGAN';
          copyFooterText = '* Lembar 2: Untuk Arsip Kantor & Verifikasi Pembayaran PT. Reka Cipta Garam.';
        }
      } else if (totalCopies === 3) {
        if (copyNumber === 1) {
          copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
          copyFooterText = '* Lembar 1: Untuk Pemasok / Pengemudi sebagai bukti penyerahan garam.';
        } else if (copyNumber === 2) {
          copyReceiverText = 'LEMBAR 2: BAGIAN TIMBANG & OPERASIONAL';
          copyFooterText = '* Lembar 2: Untuk Arsip Bagian Timbangan & Operasional Pabrik.';
        } else {
          copyReceiverText = 'LEMBAR 3: KASIR & KEUANGAN';
          copyFooterText = '* Lembar 3: Untuk Kasir & Pembukuan Keuangan.';
        }
      }

      return `
        <div class="nota-sheet print-supplier-sheet" style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; padding: 22px; max-width: 780px; margin: 0 auto; background: #FFFFFF; border: none !important; outline: none !important; box-shadow: none !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'};">
          <!-- Header Perusahaan -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #163A5F; padding-bottom: 12px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center;">
              <img src="assets/images/kop surat nota timbang.webp" alt="PT Reka Cipta Garam - Subsidiary Bawang Mas Grup" style="height: 64px; max-width: 380px; width: auto; object-fit: contain; display: block;">
            </div>
            <div style="text-align: right;">
              <div style="font-size: 13px; font-weight: 700; color: #92400E; background: #FEF3C7; padding: 3px 8px; border-radius: 4px; display: inline-block;">${copyBadgeText}</div>
              <div style="font-size: 10px; font-weight: 700; color: #163A5F; margin-top: 3px; letter-spacing: 0.02em;">[ ${copyReceiverText} ]</div>
              <div style="font-size: 10.5px; font-family: monospace; color: #64748B; margin-top: 2px;">No: ${tx.docNo}</div>
            </div>
          </div>

          <!-- Metadata Pemasok & Transaksi -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; font-size: 11.5px; margin-bottom: 14px; background: #F8FAFC; padding: 10px 14px; border-radius: 4px; border: none;">
            <div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 105px; color: #64748B; padding: 3px 0;">Nama Pemasok</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="font-weight: 700; color: #0F172A; padding: 3px 0;">${tx.supplier}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 3px 0;">Asal Daerah</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="color: #0F172A; padding: 3px 0;">${tx.originArea || '-'}, ${tx.originRegion || '-'}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 3px 0;">No. Polisi Truk</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="font-family: monospace; font-weight: 700; color: #0F172A; padding: 3px 0;">${tx.plateNo}</td>
                </tr>
              </table>
            </div>
            <div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 105px; color: #64748B; padding: 3px 0;">Tanggal Pasok</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="font-family: monospace; font-weight: 700; color: #0F172A; padding: 3px 0;">${tx.date}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 3px 0;">Waktu In / Out</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="font-family: monospace; color: #0F172A; padding: 3px 0;">${tx.timeIn || '-'} s/d ${tx.timeOut || '-'}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 3px 0;">Status Bayar</td>
                  <td style="width: 14px; text-align: center; color: #64748B; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 0;">:</td>
                  <td style="padding: 3px 0;"><strong style="color: ${tx.paymentStatus === 'Lunas' ? '#16A34A' : '#D97706'};">${tx.paymentStatus === 'Lunas' ? 'Lunas' : 'Belum Lunas'}</strong></td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Tabel Rincian Pasokan & Mutu -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; border: none;">
            <thead>
              <tr style="background: #163A5F; color: #FFFFFF;">
                <th style="padding: 7px 10px; text-align: left; border: none;">Klasifikasi Mutu</th>
                <th style="padding: 7px 10px; text-align: right; border: none;">Berat Bersih (Kg)</th>
                <th style="padding: 7px 10px; text-align: right; border: none;">Harga Satuan (Rp)</th>
                <th style="padding: 7px 10px; text-align: right; border: none;">Subtotal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 7px 10px; font-weight: 600; border: none;">Garam K1</td>
                <td style="padding: 7px 10px; text-align: right; font-family: monospace; border: none;">${(tx.k1Weight || 0).toLocaleString('id-ID')} Kg</td>
                <td style="padding: 7px 10px; text-align: right; font-family: monospace; border: none;">Rp ${(tx.k1Price || 0).toLocaleString('id-ID')}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #163A5F; border: none;">Rp ${(tx.k1Total || 0).toLocaleString('id-ID')}</td>
              </tr>
              <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 7px 10px; font-weight: 600; border: none;">Garam K2</td>
                <td style="padding: 7px 10px; text-align: right; font-family: monospace; border: none;">${(tx.k2Weight || 0).toLocaleString('id-ID')} Kg</td>
                <td style="padding: 7px 10px; text-align: right; border: none;">Rp ${(tx.k2Price || 0).toLocaleString('id-ID')}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #B45309; border: none;">Rp ${(tx.k2Total || 0).toLocaleString('id-ID')}</td>
              </tr>
              <tr style="background: #EEF2F6; font-weight: 700;">
                <td style="padding: 8px 10px; border: none;">TOTAL PASOKAN BERSIH</td>
                <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 13px; color: #163A5F; border: none;">${(tx.finalNetWeight || 0).toLocaleString('id-ID')} Kg</td>
                <td style="padding: 8px 10px; text-align: right; border: none;">TOTAL PEMBAYARAN</td>
                <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 13.5px; color: #163A5F; border: none;">Rp ${(tx.grandTotal || 0).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <!-- Ringkasan Timbangan Teknis -->
          <div style="font-size: 11px; color: #64748B; margin-bottom: 18px; padding: 6px 10px; background: #F1F5F9; border-radius: 4px; border: none;">
            Catatan Timbang: Kotor ${(tx.grossWeight || 0).toLocaleString('id-ID')} Kg • Tara ${(tx.tareWeight || 0).toLocaleString('id-ID')} Kg • Muatan ${(tx.netLoadWeight || 0).toLocaleString('id-ID')} Kg • Refraksi ${tx.refractionPercent}% (-${(tx.refractionKg || 0).toLocaleString('id-ID')} Kg)
          </div>

          <!-- Tanda Tangan Dua Pihak (Supir & Admin) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; text-align: center; font-size: 11.5px; margin-top: 24px;">
            <div style="text-align: center;">
              <div style="color: #64748B; margin-bottom: 44px;">Diserahkan oleh (Pemasok / Supir):</div>
              <div style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 140px; padding-top: 4px;">( ${tx.driverName || tx.supplier} )</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #64748B; margin-bottom: 44px;">Admin:</div>
              <div style="font-weight: 700; border-top: 1px solid #475569; display: inline-block; min-width: 140px; padding-top: 4px;">( ${tx.weighmasterName || tx.adminName || 'Admin'} )</div>
            </div>
          </div>

          <!-- Footer Catatan & Lembar -->
          <div style="font-size: 10px; color: #64748B; text-align: center; margin-top: 16px; border-top: 1px dashed #CBD5E1; padding-top: 6px;">
            ${copyFooterText}
          </div>
        </div>
      `;
    };

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog('Pratinjau Cetak Formulir Pemasok', generatorFn, tx.docNo, 'Form_Pemasok');
    } else {
      const container = document.getElementById('printable-nota');
      if (container) container.innerHTML = generatorFn(1, 1);
      window.print();
    }
  }
};
