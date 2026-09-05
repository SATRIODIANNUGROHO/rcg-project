/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Transaction History Management
 */

const HistoryManager = {
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  dateFilter: '',
  materialFilter: '',
  sortOrder: 'desc', // 'desc' (Terbaru -> Terlama) | 'asc' (Terlama -> Terbaru)
  selectedTxForAction: null,

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const searchInput = document.getElementById('history-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.render();
      });
    }

    const resetBtn = document.getElementById('history-reset-search');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        this.dateFilter = '';
        this.materialFilter = '';
        const dateInput = document.getElementById('history-date-filter');
        if (dateInput) dateInput.value = '';
        const materialSelect = document.getElementById('history-material-filter');
        if (materialSelect) materialSelect.value = '';
        this.currentPage = 1;
        this.render();
      });
    }

    const materialSelect = document.getElementById('history-material-filter');
    if (materialSelect) {
      materialSelect.addEventListener('change', (e) => {
        this.materialFilter = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const dateInput = document.getElementById('history-date-filter');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.dateFilter = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const sortSelect = document.getElementById('history-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOrder = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    const pageSizeSelect = document.getElementById('history-page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value) || 10;
        this.currentPage = 1;
        this.render();
      });
    }

    const prevBtn = document.getElementById('history-prev-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });
    }

    const nextBtn = document.getElementById('history-next-page');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.render();
        }
      });
    }
  },

  getFilteredData() {
    let data = StorageManager.getTransactions();

    // 1. Text Search Filter
    if (this.searchQuery) {
      data = data.filter(t => {
        return (
          (t.docNo && t.docNo.toLowerCase().includes(this.searchQuery)) ||
          (t.supplier && t.supplier.toLowerCase().includes(this.searchQuery)) ||
          (t.material && t.material.toLowerCase().includes(this.searchQuery)) ||
          (t.plateNo && t.plateNo.toLowerCase().includes(this.searchQuery)) ||
          (t.originArea && t.originArea.toLowerCase().includes(this.searchQuery)) ||
          (t.originRegion && t.originRegion.toLowerCase().includes(this.searchQuery))
        );
      });
    }

    // 2. Material Filter (Semua Jenis Garam | Garam Curah | Garam Karung)
    if (this.materialFilter) {
      data = data.filter(t => {
        const mat = (t.material || '').trim().toLowerCase();
        const target = this.materialFilter.trim().toLowerCase();
        if (target === 'garam curah') {
          return mat.includes('curah');
        } else if (target === 'garam karung') {
          return mat.includes('karung');
        }
        return mat === target;
      });
    }

    // 3. Date Filter
    if (this.dateFilter) {
      data = data.filter(t => t.date === this.dateFilter);
    }

    // 4. Sorting
    data.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.timeIn || '00:00')).getTime();
      const dateB = new Date(b.date + ' ' + (b.timeIn || '00:00')).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return data;
  },

  getTotalPages() {
    const totalItems = this.getFilteredData().length;
    return Math.ceil(totalItems / this.pageSize) || 1;
  },

  render() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    const filtered = this.getFilteredData();
    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + this.pageSize);

    // Update Pagination UI
    const indicator = document.getElementById('history-page-indicator');
    if (indicator) indicator.textContent = `Halaman ${this.currentPage} / ${totalPages} (${filtered.length} Data)`;

    const prevBtn = document.getElementById('history-prev-page');
    const nextBtn = document.getElementById('history-next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

    tbody.innerHTML = '';

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-secondary);">
            <strong>Tidak ada data transaksi yang sesuai filter</strong>
            <p style="font-size: 12px; margin-top: 4px;">Coba reset filter atau buat transaksi penimbangan baru.</p>
          </td>
        </tr>
      `;
      return;
    }

    const canChangePay = typeof AuthManager !== 'undefined' ? AuthManager.canChangePaymentStatus() : true;
    const canReprint = typeof AuthManager !== 'undefined' ? AuthManager.can('reprintNota') : true;
    const canEdit = typeof AuthManager !== 'undefined' ? AuthManager.canEditTransaction() : true;
    const canDelete = typeof AuthManager !== 'undefined' ? AuthManager.canDeleteTransaction() : true;

    paginatedItems.forEach((tx) => {
      const tr = document.createElement('tr');
      const isLunas = tx.paymentStatus === 'Lunas';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--primary);">${tx.material}</div>
          <div class="text-small text-secondary mono-num">${tx.docNo}</div>
        </td>
        <td class="mono-num">${tx.date}</td>
        <td><strong>${tx.supplier}</strong></td>
        <td>${tx.originArea || '-'}, ${tx.originRegion || '-'}</td>
        <td class="num-cell text-right" style="font-weight: 700; color: var(--primary);">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</td>
        <td class="num-cell text-right" style="font-weight: 700; color: var(--primary-dark);">Rp ${tx.grandTotal.toLocaleString('id-ID')}</td>
        <td class="text-center" style="white-space: nowrap;">
          <button class="badge ${isLunas ? 'badge-success' : 'badge-warning'}" style="${canChangePay ? 'cursor: pointer;' : 'cursor: default; opacity: 0.9;'} border: 1px solid; height: 26px; padding: 0 10px; font-weight: 600; white-space: nowrap; font-size: 11px;" ${canChangePay ? `onclick="HistoryManager.togglePaymentStatus('${tx.id}')"` : ''} title="${canChangePay ? 'Klik untuk mengubah status pembayaran' : 'Status Pembayaran (Read-Only)'}">
            ${isLunas ? 'Lunas' : 'Belum Lunas'}
          </button>
        </td>
        <td class="actions-cell">
          <div class="actions-group">
            <button class="btn btn-table-action action-detail" title="Lihat Detail Lengkap" onclick="HistoryManager.showDetailModal('${tx.id}')">
              Detail
            </button>
            ${canReprint ? `
            <button class="btn btn-table-action action-print" title="Cetak Nota" onclick="HistoryManager.printNotaById('${tx.id}')">
              Cetak
            </button>` : ''}
            ${canEdit ? `
            <button class="btn btn-table-action action-edit" title="Edit Transaksi" onclick="HistoryManager.editById('${tx.id}')">
              Edit
            </button>` : ''}
            ${canDelete ? `
            <button class="btn btn-table-action action-delete" title="Hapus Transaksi" onclick="HistoryManager.confirmDelete('${tx.id}')">
              Hapus
            </button>` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  togglePaymentStatus(id) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.canChangePaymentStatus()) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk mengubah status pembayaran transaksi!', 'warning');
      return;
    }
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (tx) {
      tx.paymentStatus = (tx.paymentStatus === 'Lunas') ? 'Belum Lunas' : 'Lunas';
      StorageManager.saveTransaction(tx);
      StorageManager.addLog(
        AuthManager.getCurrentUser().username,
        AuthManager.getCurrentUser().role,
        `Ubah Status Bayar Transaksi ${tx.docNo} -> ${tx.paymentStatus}`,
        tx.docNo
      );
      this.render();
      AnalyticsManager.render();
      App.showToast(`Status pembayaran ${tx.docNo} diubah ke: ${tx.paymentStatus}`, 'info');
    }
  },

  showDetailModal(id) {
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (!tx) return;

    const modalBody = document.getElementById('detail-modal-content');
    if (!modalBody) return;

    const isLunas = tx.paymentStatus === 'Lunas';

    modalBody.innerHTML = `
      <!-- 1. Dokumen & Material -->
      <div class="section-block" style="margin-bottom: 12px; padding: 14px;">
        <div class="section-block-title" style="margin-bottom: 10px;">
          <span>1. Dokumen &amp; Material</span>
          <span class="badge ${isLunas ? 'badge-success' : 'badge-warning'}">${tx.paymentStatus}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
          <div><span class="text-secondary text-small">No. Dokumen:</span><br><strong class="mono-num" style="color: var(--primary);">${tx.docNo}</strong></div>
          <div><span class="text-secondary text-small">Material:</span><br><strong>${(typeof TransactionEngine !== 'undefined' && TransactionEngine.formatMaterialDisplay) ? TransactionEngine.formatMaterialDisplay(tx) : tx.material}</strong></div>
          <div><span class="text-secondary text-small">Tanggal:</span><br><strong class="mono-num">${tx.date}</strong></div>
          <div><span class="text-secondary text-small">Waktu Masuk / Keluar:</span><br><span class="mono-num">${tx.timeIn || '-'} s/d ${tx.timeOut || '-'}</span></div>
        </div>
      </div>

      <!-- 2. Informasi Pemasok, Asal & Kendaraan -->
      <div class="section-block" style="margin-bottom: 12px; padding: 14px;">
        <div class="section-block-title" style="margin-bottom: 10px;">2. Pemasok, Asal &amp; Kendaraan</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
          <div><span class="text-secondary text-small">Pemasok:</span><br><strong>${tx.supplier}</strong></div>
          <div><span class="text-secondary text-small">Asal Garam:</span><br><strong>${tx.originArea || '-'}, ${tx.originRegion || '-'}</strong></div>
          <div><span class="text-secondary text-small">No. Polisi:</span><br><span class="badge badge-neutral mono-num" style="font-weight: 700;">${tx.plateNo}</span></div>
          <div><span class="text-secondary text-small">Nama Supir:</span><br><strong>${tx.driverName || '-'}</strong></div>
        </div>
      </div>

      <!-- 3. Rincian Lengkap Penimbangan (Kotor, Tara, Muatan, Refraksi, Bersih Total) -->
      <div class="section-block" style="margin-bottom: 12px; padding: 14px;">
        <div class="section-block-title" style="margin-bottom: 10px;">3. Rincian Lengkap Penimbangan (Kg)</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(115px, 1fr)); gap: 8px; margin-bottom: 10px;">
          <div class="mini-stat-item">
            <div class="title">BERAT KOTOR (GROSS)</div>
            <div class="value mono-num">${tx.grossWeight.toLocaleString('id-ID')} Kg</div>
          </div>
          <div class="mini-stat-item">
            <div class="title">BERAT TARA (TARE)</div>
            <div class="value mono-num">${tx.tareWeight.toLocaleString('id-ID')} Kg</div>
          </div>
          <div class="mini-stat-item">
            <div class="title">BERAT MUATAN (BRUTO)</div>
            <div class="value mono-num">${tx.netLoadWeight.toLocaleString('id-ID')} Kg</div>
          </div>
          <div class="mini-stat-item">
            <div class="title">REFRAKSI (${tx.refractionPercent}%)</div>
            <div class="value mono-num" style="color: var(--color-danger);">-${tx.refractionKg.toLocaleString('id-ID')} Kg</div>
          </div>
        </div>
        <div class="grand-total-banner" style="background: rgba(37, 99, 184, 0.12); border: 1px solid var(--primary-border); margin: 0; padding: 10px 14px;">
          <div class="lbl" style="color: var(--primary); font-weight: 700;">HASIL BERSIH TOTAL (NETTO)</div>
          <div class="val mono-num" style="font-size: 24px; color: var(--primary);">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</div>
        </div>
      </div>

      <!-- 4. Alokasi Mutu Garam & Nilai Pembayaran -->
      <div class="section-block" style="margin-bottom: 12px; padding: 14px;">
        <div class="section-block-title" style="margin-bottom: 10px;">4. Alokasi Mutu &amp; Nilai Pembayaran</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div class="mini-stat-item">
            <div class="title" style="color: var(--primary);">GARAM K1</div>
            <div class="mono-num" style="font-size: 13.5px; font-weight: 700; color: var(--primary);">${tx.k1Weight.toLocaleString('id-ID')} Kg &times; Rp ${tx.k1Price.toLocaleString('id-ID')}</div>
            <div class="text-small mono-num" style="color: var(--text-secondary); margin-top: 2px;">Subtotal: <strong>Rp ${tx.k1Total.toLocaleString('id-ID')}</strong></div>
          </div>
          <div class="mini-stat-item">
            <div class="title" style="color: var(--accent-gold);">GARAM K2</div>
            <div class="mono-num" style="font-size: 13.5px; font-weight: 700; color: var(--accent-gold);">${tx.k2Weight.toLocaleString('id-ID')} Kg &times; Rp ${tx.k2Price.toLocaleString('id-ID')}</div>
            <div class="text-small mono-num" style="color: var(--text-secondary); margin-top: 2px;">Subtotal: <strong>Rp ${tx.k2Total.toLocaleString('id-ID')}</strong></div>
          </div>
        </div>
        <div class="grand-total-banner" style="margin: 0; padding: 12px;">
          <div class="lbl">TOTAL PEMBAYARAN</div>
          <div class="val mono-num" style="font-size: 24px;">Rp ${tx.grandTotal.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <!-- 5. Otorisasi & Log Petugas -->
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); padding: 0 4px;">
        <div>Petugas Timbang: <strong style="color: var(--text-primary);">${tx.weighmasterName || '-'}</strong></div>
        <div>Operator Admin: <strong style="color: var(--text-primary);">${tx.adminName || '-'}</strong></div>
      </div>
    `;

    App.openModal('modal-transaction-detail');
  },

  printNotaById(id) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.can('reprintNota')) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk mencetak ulang nota transaksi!', 'warning');
      return;
    }
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (tx) {
      const generatorFn = (copyNumber, totalCopies) => TransactionEngine.generateNotaHtml(tx, copyNumber, totalCopies);
      if (typeof PrintManager !== 'undefined') {
        PrintManager.openPrintDialog('Pratinjau Cetak Nota Timbang', generatorFn, tx.docNo, 'Nota_Timbang');
      } else {
        const container = document.getElementById('printable-nota');
        if (container) container.innerHTML = generatorFn(1, 1);
        window.print();
      }
    }
  },

  editById(id) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.canEditTransaction()) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk mengubah data transaksi!', 'warning');
      return;
    }
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (tx) {
      TransactionEngine.loadForEdit(tx);
    }
  },

  confirmDelete(id) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.canDeleteTransaction()) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk menghapus transaksi ini!', 'warning');
      return;
    }
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (!tx) return;

    this.selectedTxForAction = tx;
    const msg = document.getElementById('delete-modal-msg');
    if (msg) msg.innerHTML = `Apakah Anda yakin ingin menghapus data transaksi <strong>${tx.docNo}</strong> (${tx.supplier} - ${tx.plateNo})?`;

    const reasonInput = document.getElementById('input-delete-reason');
    if (reasonInput) reasonInput.value = '';

    App.openModal('modal-confirm-delete');
  },

  executeDelete() {
    if (this.selectedTxForAction) {
      const docNo = this.selectedTxForAction.docNo;
      const reasonInput = document.getElementById('input-delete-reason');
      const reason = reasonInput ? reasonInput.value.trim() : '';

      if (!reason) {
        App.showToast('Alasan penghapusan data wajib diisi!', 'warning');
        if (reasonInput) reasonInput.focus();
        return;
      }

      StorageManager.deleteTransaction(this.selectedTxForAction.id);
      StorageManager.addLog(
        AuthManager.getCurrentUser().username,
        AuthManager.getCurrentUser().role,
        `Hapus Transaksi Penimbangan: ${docNo}`,
        docNo,
        reason
      );
      this.selectedTxForAction = null;
      App.closeModal('modal-confirm-delete');
      this.render();
      if (typeof SupplierHistoryManager !== 'undefined') {
        SupplierHistoryManager.render();
      }
      AnalyticsManager.render();
      App.renderActivityLogs();
      App.showToast(`Transaksi ${docNo} berhasil dihapus.`, 'danger');
    }
  }
};
