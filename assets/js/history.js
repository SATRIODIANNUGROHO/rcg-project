/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Weighing Transaction History (Riwayat Penimbangan)
 */

const HistoryManager = {
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  dateFilter: '',
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
        const dateInput = document.getElementById('history-date-filter');
        if (dateInput) dateInput.value = '';
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

    // 2. Date Filter
    if (this.dateFilter) {
      data = data.filter(t => t.date === this.dateFilter);
    }

    // 3. Sorting
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
          <td colspan="15" style="text-align: center; padding: 32px; color: var(--text-secondary);">
            <strong>Tidak ada data transaksi yang sesuai filter</strong>
            <p style="font-size: 12px; margin-top: 4px;">Coba reset filter atau buat transaksi penimbangan baru.</p>
          </td>
        </tr>
      `;
      return;
    }

    paginatedItems.forEach((tx) => {
      const tr = document.createElement('tr');
      const isLunas = tx.paymentStatus === 'Lunas';

      tr.innerHTML = `
        <td class="actions-cell">
          <button class="btn btn-table-action action-detail" title="Lihat Detail" onclick="HistoryManager.showDetailModal('${tx.id}')">
            Detail
          </button>
          <button class="btn btn-table-action action-print" title="Cetak Nota" onclick="HistoryManager.printNotaById('${tx.id}')">
            Cetak
          </button>
          <button class="btn btn-table-action action-edit" title="Edit Transaksi" onclick="HistoryManager.editById('${tx.id}')">
            Edit
          </button>
          <button class="btn btn-table-action action-delete" title="Hapus Transaksi" onclick="HistoryManager.confirmDelete('${tx.id}')">
            Hapus
          </button>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${tx.material}</div>
          <div class="text-small text-secondary mono-num">${tx.docNo}</div>
        </td>
        <td class="mono-num">${tx.date}</td>
        <td><strong>${tx.supplier}</strong></td>
        <td>${tx.originArea || '-'}, ${tx.originRegion || '-'}</td>
        <td><span class="badge badge-neutral mono-num" style="font-weight:700;">${tx.plateNo}</span></td>
        <td class="num-cell">${tx.grossWeight.toLocaleString('id-ID')}</td>
        <td class="num-cell">${tx.tareWeight.toLocaleString('id-ID')}</td>
        <td class="num-cell" style="font-weight: 600;">${tx.netLoadWeight.toLocaleString('id-ID')}</td>
        <td class="num-cell text-center">${tx.refractionPercent}%</td>
        <td class="num-cell" style="font-weight: 700; color: var(--primary-dark);">${tx.finalNetWeight.toLocaleString('id-ID')}</td>
        <td class="num-cell" style="color: var(--primary);">${tx.k1Weight.toLocaleString('id-ID')}</td>
        <td class="num-cell" style="color: var(--accent-gold);">${tx.k2Weight.toLocaleString('id-ID')}</td>
        <td class="num-cell" style="font-weight: 700; color: var(--primary-dark);">Rp ${tx.grandTotal.toLocaleString('id-ID')}</td>
        <td class="text-center">
          <button class="badge ${isLunas ? 'badge-success' : 'badge-warning'}" style="cursor: pointer; border: none; height: 24px; padding: 0 8px;" onclick="HistoryManager.togglePaymentStatus('${tx.id}')" title="Klik untuk mengubah status pembayaran">
            ${isLunas ? 'Lunas' : 'Belum Lunas'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  togglePaymentStatus(id) {
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

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
        <div class="mini-stat-item">
          <div class="title">Nomor Dokumen</div>
          <div class="value mono-num" style="color: var(--primary);">${tx.docNo}</div>
        </div>
        <div class="mini-stat-item">
          <div class="title">Tanggal & Waktu</div>
          <div class="value mono-num">${tx.date} (${tx.timeIn || '-'} s/d ${tx.timeOut || '-'})</div>
        </div>
        <div class="mini-stat-item">
          <div class="title">Nomor Polisi</div>
          <div class="value mono-num">${tx.plateNo}</div>
        </div>
        <div class="mini-stat-item">
          <div class="title">Pemasok / Supplier</div>
          <div class="value">${tx.supplier}</div>
        </div>
        <div class="mini-stat-item">
          <div class="title">Material & Karung</div>
          <div class="value">${tx.material} ${tx.bagCount ? '(' + tx.bagCount + ' Karung)' : ''}</div>
        </div>
        <div class="mini-stat-item">
          <div class="title">Asal Garam</div>
          <div class="value">${tx.originArea || '-'}, ${tx.originRegion || '-'}</div>
        </div>
      </div>

      <div class="section-block" style="margin-bottom: 14px;">
        <div class="section-block-title">Rincian Timbangan</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div><span class="text-secondary text-small">Berat Kotor (Gross):</span> <br><strong class="mono-num">${tx.grossWeight.toLocaleString('id-ID')} Kg</strong></div>
          <div><span class="text-secondary text-small">Berat Tara (Tare):</span> <br><strong class="mono-num">${tx.tareWeight.toLocaleString('id-ID')} Kg</strong></div>
          <div><span class="text-secondary text-small">Berat Muatan (Bruto):</span> <br><strong class="mono-num">${tx.netLoadWeight.toLocaleString('id-ID')} Kg</strong></div>
          <div><span class="text-secondary text-small">Refraksi:</span> <br><strong class="mono-num">${tx.refractionPercent}% (${tx.refractionKg.toLocaleString('id-ID')} Kg)</strong></div>
          <div style="grid-column: span 2;"><span class="text-secondary text-small">BERSIH TOTAL:</span> <br><strong class="mono-num text-display" style="font-size: 22px; color: var(--primary);">${tx.finalNetWeight.toLocaleString('id-ID')} Kg</strong></div>
        </div>
      </div>

      <div class="section-block">
        <div class="section-block-title">Rincian Mutu & Nominal</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <span class="text-secondary text-small">Kualitas K1 (Super):</span><br>
            <strong class="mono-num">${tx.k1Weight.toLocaleString('id-ID')} Kg</strong> @ Rp ${tx.k1Price.toLocaleString('id-ID')}<br>
            <span class="mono-num" style="color: var(--primary);">Subtotal: Rp ${tx.k1Total.toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span class="text-secondary text-small">Kualitas K2 (Standar):</span><br>
            <strong class="mono-num">${tx.k2Weight.toLocaleString('id-ID')} Kg</strong> @ Rp ${tx.k2Price.toLocaleString('id-ID')}<br>
            <span class="mono-num" style="color: var(--accent-gold);">Subtotal: Rp ${tx.k2Total.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div class="grand-total-banner" style="margin-top: 6px; padding: 12px;">
          <div class="lbl">TOTAL PEMBAYARAN</div>
          <div class="val" style="font-size: 24px;">Rp ${tx.grandTotal.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 10px;">
        <div>Supir: <strong>${tx.driverName}</strong></div>
        <div>Petugas: <strong>${tx.weighmasterName}</strong></div>
        <div>Admin: <strong>${tx.adminName}</strong></div>
      </div>
    `;

    App.openModal('modal-transaction-detail');
  },

  printNotaById(id) {
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (tx) {
      TransactionEngine.preparePrintNota(tx);
      if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
        window.electronAPI.printNota();
      } else {
        window.print();
      }
    }
  },

  editById(id) {
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (tx) {
      TransactionEngine.loadForEdit(tx);
    }
  },

  confirmDelete(id) {
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (!tx) return;

    this.selectedTxForAction = tx;
    const msg = document.getElementById('delete-modal-msg');
    if (msg) msg.innerHTML = `Apakah Anda yakin ingin menghapus data transaksi <strong>${tx.docNo}</strong> (${tx.supplier} - ${tx.plateNo})?`;
    App.openModal('modal-confirm-delete');
  },

  executeDelete() {
    if (this.selectedTxForAction) {
      const docNo = this.selectedTxForAction.docNo;
      StorageManager.deleteTransaction(this.selectedTxForAction.id);
      StorageManager.addLog(
        AuthManager.getCurrentUser().username,
        AuthManager.getCurrentUser().role,
        `Hapus Transaksi Penimbangan: ${docNo}`,
        docNo
      );
      this.selectedTxForAction = null;
      App.closeModal('modal-confirm-delete');
      this.render();
      AnalyticsManager.render();
      App.showToast(`Transaksi ${docNo} berhasil dihapus.`, 'danger');
    }
  }
};
