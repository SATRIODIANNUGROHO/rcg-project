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

      const isLunas = (tx.paymentStatus && tx.paymentStatus.trim().toLowerCase() === 'lunas');
      const payStatusText = isLunas ? 'Lunas' : 'Belum Lunas';

      return `
        <div class="nota-sheet print-supplier-sheet" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #000000; padding: 16px 18px; width: 100%; box-sizing: border-box; margin: 0 auto; background: #FFFFFF; border: none !important; outline: none !important; box-shadow: none !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'};">
          <!-- Header Logo Centered -->
          <div style="text-align: center; margin-bottom: 12px;">
            <img src="assets/images/kop surat nota timbang.webp" alt="PT REKA CIPTA GARAM - Subsidiary Bawang Mas Grup" style="max-height: 56px; max-width: 100%; width: auto; height: auto; object-fit: contain; display: inline-block;">
          </div>

          <!-- Solid Divider -->
          <div style="border-top: 2.5px solid #000000; margin: 0 0 12px 0;"></div>

          <!-- Title -->
          <div style="text-align: center; font-size: 15px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; color: #000000;">
            ${copyBadgeText}
            ${totalCopies > 1 ? `<div style="font-size: 9.5px; font-weight: 700; color: #475569; margin-top: 2px; letter-spacing: 0.04em;">[ ${copyReceiverText} ]</div>` : ''}
          </div>

          <!-- Metadata Section (2 Columns) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 11px; margin-bottom: 8px; line-height: 1.4;">
            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Tanggal Pasok</div>
              <div style="color: #000000; margin-bottom: 8px;">${tx.date}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">No. Polisi</div>
              <div style="color: #000000; margin-bottom: 8px;">${tx.plateNo}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Nama Supir</div>
              <div style="color: #000000; margin-bottom: 8px;">${tx.driverName || '-'}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Asal Daerah</div>
              <div style="color: #000000;">${tx.originArea || '-'}${tx.originRegion ? ', ' + tx.originRegion : ''}</div>
            </div>

            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">No. Dok</div>
              <div style="color: #000000; margin-bottom: 8px;">${tx.docNo}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Nama Pemasok</div>
              <div style="color: #000000; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tx.supplier}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Material</div>
              <div style="display: flex; justify-content: space-between; color: #000000; margin-bottom: 8px;">
                <span>${tx.material || 'Garam'}</span>
                <span>${tx.bagCount ? tx.bagCount + ' Karung' : ''}</span>
              </div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Waktu Timbang / Status</div>
              <div style="display: flex; justify-content: space-between; color: #000000;">
                <span>${tx.timeIn || '-'} s/d ${tx.timeOut || '-'}</span>
                <span style="font-weight: 700;">${payStatusText}</span>
              </div>
            </div>
          </div>

          <!-- Dashed Divider 1 -->
          <div style="border-top: 1px dashed #000000; margin: 10px 0;"></div>

          <!-- Weight Section (2 Columns) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 11px; margin-bottom: 8px; line-height: 1.4;">
            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Kotor (Gross)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.grossWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Muatan (Bruto)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.netLoadWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Bersih Total (Kg)</div>
              <div style="color: #000000;">${(tx.finalNetWeight || 0).toLocaleString('id-ID')} Kg</div>
            </div>

            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Tara (Tare)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.tareWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Refraksi (%)</div>
              <div style="color: #000000;">${tx.refractionPercent || 0}%</div>
            </div>
          </div>

          <!-- Dashed Divider 2 -->
          <div style="border-top: 1px dashed #000000; margin: 10px 0;"></div>

          <!-- Quality & Price Section (2 Columns) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 11px; margin-bottom: 8px; line-height: 1.4;">
            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Bersih K1 (Kg)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.k1Weight || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Berat Bersih K2 (Kg)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.k2Weight || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Total K1 (Rp)</div>
              <div style="color: #000000;">Rp ${(tx.k1Total || 0).toLocaleString('id-ID')}</div>
            </div>

            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Harga K1 / Kg (Rp)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.k1Price || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Harga K2 / Kg (Rp)</div>
              <div style="color: #000000; margin-bottom: 8px;">${(tx.k2Price || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #000000; margin-bottom: 2px;">Total K2 (Rp)</div>
              <div style="color: #000000;">Rp ${(tx.k2Total || 0).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <!-- Total Keseluruhan -->
          <div style="margin-top: 8px; font-size: 11px;">
            <div style="font-weight: 800; color: #000000; text-transform: uppercase;">TOTAL KESELURUHAN (Rp)</div>
            <div style="font-weight: 800; font-size: 12px; color: #000000; margin-top: 2px;">Rp ${(tx.grandTotal || 0).toLocaleString('id-ID')}</div>
          </div>

          <!-- Signatures -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-top: 28px; font-size: 11px;">
            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 42px;">Pemasok / Supir</div>
              <div style="font-weight: 700; color: #000000; text-transform: uppercase;">${tx.driverName || tx.supplier || 'SUPIR'}</div>
            </div>
            <div>
              <div style="font-weight: 700; color: #000000; margin-bottom: 42px;">Admin</div>
              <div style="font-weight: 700; color: #000000; text-transform: uppercase;">${tx.weighmasterName || tx.adminName || 'ADMIN'}</div>
            </div>
          </div>

          <!-- Footer Note -->
          ${totalCopies > 1 ? `
            <div style="font-size: 8.5px; color: #64748B; text-align: center; margin-top: 14px; border-top: 1px dotted #CBD5E1; padding-top: 4px;">
              ${copyFooterText}
            </div>
          ` : ''}
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
