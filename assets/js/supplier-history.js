/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Riwayat Pemasok / Supplier & Cetak Rekapitulasi Harian Pemasok
 * Grouping and daily accumulation of transactions by Supplier and Date
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

  /**
   * Group all transactions by (Supplier + Date)
   * Business Rule:
   * 1 row = 1 Supplier on 1 Date
   * All transactions of the same supplier on the same date are aggregated.
   */
  getGroupedData() {
    const rawTxs = StorageManager.getTransactions();
    const groupMap = new Map();

    rawTxs.forEach((tx) => {
      const supplierName = (tx.supplier || '').trim() || 'Pemasok Tanpa Nama';
      const dateStr = (tx.date || '').trim() || '-';
      const groupKey = `${supplierName.toLowerCase()}|||${dateStr}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          supplier: supplierName,
          date: dateStr,
          txCount: 0,
          grossWeight: 0,
          tareWeight: 0,
          netLoadWeight: 0,
          finalNetWeight: 0,
          k1Weight: 0,
          k2Weight: 0,
          k1Total: 0,
          k2Total: 0,
          grandTotal: 0,
          bagCount: 0,
          materials: new Set(),
          plateNos: new Set(),
          drivers: new Set(),
          originAreas: new Set(),
          originRegions: new Set(),
          docNos: [],
          lunasCount: 0,
          unpaidCount: 0,
          transactions: []
        });
      }

      const g = groupMap.get(groupKey);
      g.txCount += 1;
      g.grossWeight += Number(tx.grossWeight) || 0;
      g.tareWeight += Number(tx.tareWeight) || 0;
      g.netLoadWeight += Number(tx.netLoadWeight) || 0;
      g.finalNetWeight += Number(tx.finalNetWeight) || 0;
      g.k1Weight += Number(tx.k1Weight) || 0;
      g.k2Weight += Number(tx.k2Weight) || 0;
      g.k1Total += Number(tx.k1Total) || 0;
      g.k2Total += Number(tx.k2Total) || 0;
      g.grandTotal += Number(tx.grandTotal) || 0;
      g.bagCount += Number(tx.bagCount) || 0;

      if (tx.material) g.materials.add(tx.material.trim());
      if (tx.plateNo) g.plateNos.add(tx.plateNo.trim());
      if (tx.driverName) g.drivers.add(tx.driverName.trim());
      if (tx.originArea) g.originAreas.add(tx.originArea.trim());
      if (tx.originRegion) g.originRegions.add(tx.originRegion.trim());
      if (tx.docNo) g.docNos.push(tx.docNo.trim());

      const isLunas = (tx.paymentStatus && tx.paymentStatus.trim().toLowerCase() === 'lunas');
      if (isLunas) {
        g.lunasCount += 1;
      } else {
        g.unpaidCount += 1;
      }

      g.transactions.push(tx);
    });

    // Convert map to array and format summaries
    let groups = Array.from(groupMap.values()).map(g => {
      let paymentStatus = 'Belum Lunas';
      let statusBadgeClass = 'badge-danger';

      if (g.unpaidCount === 0 && g.lunasCount > 0) {
        paymentStatus = 'Lunas';
        statusBadgeClass = 'badge-success';
      } else if (g.lunasCount > 0 && g.unpaidCount > 0) {
        paymentStatus = `Sebagian (${g.lunasCount}/${g.txCount} Lunas)`;
        statusBadgeClass = 'badge-warning';
      }

      // Sort member transactions chronologically by timeIn
      g.transactions.sort((a, b) => {
        const timeA = (a.timeIn || '00:00');
        const timeB = (b.timeIn || '00:00');
        return timeA.localeCompare(timeB);
      });

      const originParts = [];
      if (g.originRegions.size > 0) originParts.push(Array.from(g.originRegions).join(', '));
      if (g.originAreas.size > 0) originParts.push(Array.from(g.originAreas).join(', '));
      const originSummary = originParts.join(' - ');

      return {
        ...g,
        materialsSummary: Array.from(g.materials).join(', ') || 'GARAM',
        plateNosSummary: Array.from(g.plateNos).join(', ') || '-',
        driversSummary: Array.from(g.drivers).join(', ') || '-',
        originSummary: originSummary || '-',
        paymentStatus: paymentStatus,
        statusBadgeClass: statusBadgeClass
      };
    });

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      groups = groups.filter(g =>
        g.supplier.toLowerCase().includes(q) ||
        g.date.toLowerCase().includes(q) ||
        g.materialsSummary.toLowerCase().includes(q) ||
        g.plateNosSummary.toLowerCase().includes(q) ||
        g.driversSummary.toLowerCase().includes(q) ||
        g.originSummary.toLowerCase().includes(q) ||
        g.docNos.some(d => d.toLowerCase().includes(q))
      );
    }

    // Filter by Selected Supplier
    if (this.selectedSupplier) {
      const target = this.selectedSupplier.toLowerCase().trim();
      groups = groups.filter(g => g.supplier.toLowerCase().includes(target));
    }

    // Filter by Selected Date
    if (this.selectedDate) {
      groups = groups.filter(g => g.date === this.selectedDate);
    }

    // Sort groups by Date
    groups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return a.supplier.localeCompare(b.supplier);
    });

    return groups;
  },

  render() {
    if (this.combobox) {
      this.combobox.refresh();
    }
    const tbody = document.getElementById('supplier-history-table-body');
    if (!tbody) return;

    const groupedData = this.getGroupedData();
    const totalPages = Math.ceil(groupedData.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paginated = groupedData.slice(startIdx, startIdx + this.pageSize);

    const indicator = document.getElementById('supplier-history-page-indicator');
    if (indicator) {
      indicator.textContent = `Halaman ${this.currentPage} / ${totalPages} (${groupedData.length} Rekap Pemasok)`;
    }

    const prevBtn = document.getElementById('supplier-history-prev-page');
    const nextBtn = document.getElementById('supplier-history-next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

    tbody.innerHTML = '';

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 36px 16px; color: var(--text-secondary);">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Tidak ada data rekapitulasi pemasok yang sesuai</div>
            <p style="font-size: 12px; margin: 0;">Silakan sesuaikan kata kunci pencarian, filter pemasok, atau rentang tanggal.</p>
          </td>
        </tr>
      `;
      return;
    }

    paginated.forEach((group) => {
      const tr = document.createElement('tr');

      // Truncate origin summary to prevent extremely tall rows while keeping full text accessible via tooltip
      const rawOrigin = group.originSummary !== '-'
        ? group.originSummary
        : (group.plateNosSummary !== '-' ? 'No. Pol: ' + group.plateNosSummary : 'Pemasok Terdaftar');
      const originDisplay = rawOrigin.length > 32 ? rawOrigin.substring(0, 30) + '...' : rawOrigin;

      tr.innerHTML = `
        <td class="mono-num text-center" style="white-space: nowrap; font-weight: 600;">${group.date}</td>
        <td style="max-width: 170px;">
          <div style="font-weight: 700; color: var(--text-primary); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${group.supplier}">${group.supplier}</div>
          <div class="text-small text-secondary" style="font-size: 11px; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${rawOrigin}">${originDisplay}</div>
        </td>
        <td class="text-center" style="white-space: nowrap;">
          <span class="badge badge-info" style="font-weight: 700; font-size: 11px; padding: 3px 7px; border-radius: 5px; letter-spacing: 0.02em;">
            ${group.txCount} Transaksi
          </span>
        </td>
        <td class="num-cell mono-num" style="font-weight: 700; color: var(--primary); white-space: nowrap;">
          ${(group.finalNetWeight || 0).toLocaleString('id-ID')} Kg
        </td>
        <td class="num-cell mono-num" style="color: var(--primary); font-weight: 600; white-space: nowrap;">
          ${(group.k1Weight || 0).toLocaleString('id-ID')} Kg
        </td>
        <td class="num-cell mono-num" style="color: var(--accent-gold); font-weight: 600; white-space: nowrap;">
          ${(group.k2Weight || 0).toLocaleString('id-ID')} Kg
        </td>
        <td class="num-cell mono-num" style="color: var(--primary); white-space: nowrap;">
          Rp ${(group.k1Total || 0).toLocaleString('id-ID')}
        </td>
        <td class="num-cell mono-num" style="color: var(--accent-gold); white-space: nowrap;">
          Rp ${(group.k2Total || 0).toLocaleString('id-ID')}
        </td>
        <td class="num-cell mono-num" style="font-weight: 800; color: var(--primary-dark); font-size: 12.5px; white-space: nowrap;">
          Rp ${(group.grandTotal || 0).toLocaleString('id-ID')}
        </td>
        <td class="text-center" style="white-space: nowrap;">
          <span class="badge ${group.statusBadgeClass}" style="font-weight: 600; font-size: 11px; padding: 3px 8px; border-radius: 5px; white-space: nowrap;">
            ${group.paymentStatus}
          </span>
        </td>
        <td class="actions-cell text-center" style="white-space: nowrap;">
          <button class="btn btn-table-action action-print" style="padding: 4px 8px; font-weight: 600; font-size: 11px; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;" title="Cetak Formulir Rekapitulasi Harian Pemasok" onclick="SupplierHistoryManager.printDailySummary('${encodeURIComponent(group.key)}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Cetak Rekap</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  formatMaterialDisplay(tx) {
    if (!tx) return 'GARAM';
    const mat = (tx.material || '').trim();
    const bagCount = parseInt(tx.bagCount, 10) || 0;

    if (!mat) {
      return bagCount > 0 ? `GARAM ${bagCount} KARUNG` : 'GARAM';
    }

    const upper = mat.toUpperCase();
    const isCurah = upper.includes('CURAH');

    if (/\d+/.test(upper)) {
      if (upper.includes('KARUNG') || upper.includes('KG') || upper.includes('TON')) {
        return upper;
      }
      return isCurah ? `${upper} KG` : `${upper} KARUNG`;
    }

    if (isCurah) {
      if (bagCount > 0) {
        return `GARAM CURAH ${bagCount} KG`;
      }
      return 'GARAM CURAH';
    } else {
      if (bagCount > 0) {
        return `GARAM ${bagCount} KARUNG`;
      }
      return upper.includes('KARUNG') ? upper : `${upper} KARUNG`;
    }
  },

  /**
   * Print official Daily Supplier Recap Document
   * Generates Formulir Rekapitulasi Harian Pemasok with member transaction details
   */
  printDailySummary(encodedKey) {
    const key = decodeURIComponent(encodedKey);
    const groups = this.getGroupedData();
    const group = groups.find(g => g.key === key);

    if (!group) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Data rekapitulasi pemasok tidak ditemukan.', 'error');
      }
      return;
    }

    const generatorFn = (copyNumber, totalCopies) => {
      let copyBadgeText = 'FORMULIR REKAPITULASI HARIAN PEMASOK';
      let copyReceiverText = 'LEMBAR UTAMA (ASLI)';
      let copyFooterText = '* Dokumen ini merupakan bukti sah rekapitulasi penimbangan garam harian PT. Reka Cipta Garam.';

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

      // Build Transaction Rows
      const txRowsHtml = group.transactions.map((tx, idx) => {
        const isTxLunas = (tx.paymentStatus && tx.paymentStatus.trim().toLowerCase() === 'lunas');
        const payStatusStr = isTxLunas ? 'Lunas' : 'Belum';
        const payColor = isTxLunas ? '#16A34A' : '#D97706';

        return `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 8.5px;">
            <td style="padding: 3px 2px; text-align: center; border: 1px solid #CBD5E1;">${idx + 1}</td>
            <td style="padding: 3px 3px; font-family: monospace; font-weight: 700; border: 1px solid #CBD5E1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${tx.docNo || '-'}">${tx.docNo || '-'}</td>
            <td style="padding: 3px 3px; font-family: monospace; text-align: center; border: 1px solid #CBD5E1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tx.plateNo || '-'}</td>
            <td style="padding: 3px 3px; border: 1px solid #CBD5E1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${tx.driverName || '-'}">${tx.driverName || '-'}</td>
            <td style="padding: 3px 2px; text-align: center; border: 1px solid #CBD5E1; white-space: nowrap;">${tx.timeIn || '-'}${tx.timeOut ? ' - ' + tx.timeOut : ''}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(tx.netLoadWeight || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(tx.tareWeight || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; font-weight: 700; color: #163A5F; border: 1px solid #CBD5E1; white-space: nowrap;">${(tx.finalNetWeight || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(tx.k1Weight || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(tx.k2Weight || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 3px; text-align: right; font-family: monospace; font-weight: 700; color: #0F172A; border: 1px solid #CBD5E1; white-space: nowrap;">Rp ${(tx.grandTotal || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 3px 2px; text-align: center; font-weight: 700; color: ${payColor}; border: 1px solid #CBD5E1; white-space: nowrap;">${payStatusStr}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="nota-sheet print-supplier-sheet" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0F172A; padding: 8px 14px; width: 100%; box-sizing: border-box; margin: 0 auto; background: #FFFFFF; border: none !important; outline: none !important; box-shadow: none !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'}; page-break-inside: avoid !important; break-inside: avoid !important;">
          <!-- Header Logo Centered -->
          <div style="text-align: center; margin-bottom: 6px;">
            <img src="assets/images/kop surat nota timbang.webp" alt="PT REKA CIPTA GARAM - Subsidiary Bawang Mas Grup" style="max-height: 42px; max-width: 100%; width: auto; height: auto; object-fit: contain; display: inline-block;">
          </div>

          <!-- Solid Theme Divider -->
          <div style="border-top: 2px solid #163A5F; margin: 0 0 6px 0;"></div>

          <!-- Title -->
          <div style="text-align: center; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; color: #163A5F;">
            ${copyBadgeText}
            ${totalCopies > 1 ? `<div style="font-size: 9px; font-weight: 700; color: #64748B; margin-top: 2px; letter-spacing: 0.04em;">[ ${copyReceiverText} ]</div>` : ''}
          </div>

          <!-- Metadata Section (2 Columns) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; font-size: 9.5px; margin-bottom: 6px; line-height: 1.3; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px 10px; border-radius: 4px;">
            <div>
              <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Nama Pemasok:</span>
                <span style="font-weight: 800; color: #0F172A; text-transform: uppercase;">${group.supplier}</span>
              </div>
              <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Tanggal Pengiriman:</span>
                <span style="font-weight: 700; color: #0F172A; font-family: monospace;">${group.date}</span>
              </div>
              <div style="display: flex;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Asal Daerah / Wilayah:</span>
                <span style="font-weight: 600; color: #0F172A;">${group.originSummary}</span>
              </div>
            </div>

            <div>
              <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Total Pengiriman (Rit):</span>
                <span style="font-weight: 800; color: #163A5F;">${group.txCount} Transaksi / Rit</span>
              </div>
              <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Material Pasokan:</span>
                <span style="font-weight: 600; color: #0F172A;">${group.materialsSummary}</span>
              </div>
              <div style="display: flex;">
                <span style="width: 120px; color: #475569; font-weight: 600;">Status Pembayaran:</span>
                <span style="font-weight: 800; color: ${group.unpaidCount === 0 ? '#16A34A' : (group.lunasCount > 0 ? '#D97706' : '#DC2626')};">${group.paymentStatus}</span>
              </div>
            </div>
          </div>

          <!-- Highlight Metric Cards (4 Columns) -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px;">
            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 4px 6px; text-align: center;">
              <div style="font-size: 8px; color: #1E40AF; font-weight: 700; text-transform: uppercase;">Total Tonase Bersih</div>
              <div style="font-size: 11px; font-weight: 800; color: #1E3A8A; font-family: monospace; margin-top: 1px;">${(group.finalNetWeight || 0).toLocaleString('id-ID')} Kg</div>
            </div>
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 4px; padding: 4px 6px; text-align: center;">
              <div style="font-size: 8px; color: #166534; font-weight: 700; text-transform: uppercase;">Mutu K1 (Subtotal)</div>
              <div style="font-size: 11px; font-weight: 800; color: #14532D; font-family: monospace; margin-top: 1px;">Rp ${(group.k1Total || 0).toLocaleString('id-ID')}</div>
              <div style="font-size: 7.5px; color: #166534; font-weight: 600;">${(group.k1Weight || 0).toLocaleString('id-ID')} Kg</div>
            </div>
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 4px; padding: 4px 6px; text-align: center;">
              <div style="font-size: 8px; color: #92400E; font-weight: 700; text-transform: uppercase;">Mutu K2 (Subtotal)</div>
              <div style="font-size: 11px; font-weight: 800; color: #78350F; font-family: monospace; margin-top: 1px;">Rp ${(group.k2Total || 0).toLocaleString('id-ID')}</div>
              <div style="font-size: 7.5px; color: #92400E; font-weight: 600;">${(group.k2Weight || 0).toLocaleString('id-ID')} Kg</div>
            </div>
            <div style="background: #163A5F; border: 1px solid #163A5F; border-radius: 4px; padding: 4px 6px; text-align: center; color: #FFFFFF;">
              <div style="font-size: 8px; color: #E2E8F0; font-weight: 700; text-transform: uppercase;">Total Pembayaran</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #FFFFFF; font-family: monospace; margin-top: 1px;">Rp ${(group.grandTotal || 0).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <!-- Section Label -->
          <div style="font-size: 9.5px; font-weight: 800; color: #163A5F; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.03em;">
            Rincian Pengiriman Pemasok (${group.txCount} Transaksi / Surat Jalan)
          </div>

          <!-- Table of Shipments Breakdown -->
          <div style="width: 100%; margin-bottom: 8px; box-sizing: border-box;">
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 8.5px; border: 1px solid #CBD5E1;">
              <thead>
                <tr style="background: #163A5F; color: #FFFFFF; font-weight: 700; text-align: center;">
                  <th style="padding: 4px 2px; border: 1px solid #CBD5E1; width: 3.5%;">No</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 14%;">No. Dokumen</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 9.5%;">No. Polisi</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 11%;">Supir</th>
                  <th style="padding: 4px 2px; border: 1px solid #CBD5E1; width: 8.5%;">Waktu</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 8%;">Bruto (Kg)</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 7.5%;">Tara (Kg)</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 8.5%;">Netto (Kg)</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 7.5%;">K1 (Kg)</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 7%;">K2 (Kg)</th>
                  <th style="padding: 4px 3px; border: 1px solid #CBD5E1; width: 12.5%;">Total (Rp)</th>
                  <th style="padding: 4px 2px; border: 1px solid #CBD5E1; width: 6.5%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${txRowsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #F1F5F9; font-weight: 800; font-size: 8.5px; border-top: 2px solid #163A5F;">
                  <td colspan="5" style="padding: 4px 6px; text-align: center; border: 1px solid #CBD5E1; letter-spacing: 0.03em;">
                    TOTAL REKAPITULASI (${group.txCount} PENGIRIMAN)
                  </td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(group.netLoadWeight || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(group.tareWeight || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; font-weight: 800; color: #163A5F; border: 1px solid #CBD5E1; white-space: nowrap;">${(group.finalNetWeight || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(group.k1Weight || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; border: 1px solid #CBD5E1; white-space: nowrap;">${(group.k2Weight || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 3px; text-align: right; font-family: monospace; font-weight: 800; color: #163A5F; border: 1px solid #CBD5E1; white-space: nowrap;">Rp ${(group.grandTotal || 0).toLocaleString('id-ID')}</td>
                  <td style="padding: 4px 2px; text-align: center; font-size: 8px; border: 1px solid #CBD5E1;">-</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Signatures (3 Columns) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; margin-top: 10px; font-size: 9px;">
            <div>
              <div style="color: #64748B; margin-bottom: 24px;">Pemasok / Pengemudi</div>
              <div style="font-weight: 700; color: #0F172A; text-transform: uppercase; display: inline-block; border-top: 1px solid #64748B; min-width: 90px; padding-top: 2px;">( ${group.supplier} )</div>
            </div>
            <div>
              <div style="color: #64748B; margin-bottom: 24px;">Bagian Timbangan</div>
              <div style="font-weight: 700; color: #0F172A; text-transform: uppercase; display: inline-block; border-top: 1px solid #64748B; min-width: 90px; padding-top: 2px;">( TIMBANGAN )</div>
            </div>
            <div>
              <div style="color: #64748B; margin-bottom: 24px;">Kasir / Keuangan</div>
              <div style="font-weight: 700; color: #0F172A; text-transform: uppercase; display: inline-block; border-top: 1px solid #64748B; min-width: 90px; padding-top: 2px;">( KEUANGAN )</div>
            </div>
          </div>

          <!-- Footer Note -->
          <div style="font-size: 7.5px; color: #64748B; text-align: center; margin-top: 8px; border-top: 1px dotted #CBD5E1; padding-top: 2px;">
            ${copyFooterText}
          </div>
        </div>
      `;
    };

    const docIdentifier = `REKAP-${group.supplier.replace(/[^a-zA-Z0-9]/g, '_')}-${group.date}`;

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog('Pratinjau Cetak Rekapitulasi Harian Pemasok', generatorFn, docIdentifier, 'Rekap_Pemasok', 'A4');
    } else {
      const container = document.getElementById('printable-nota');
      if (container) container.innerHTML = generatorFn(1, 1);
      window.print();
    }
  },

  /**
   * Backward-compatible fallback for individual supplier ticket
   */
  printSupplierForm(id) {
    const list = StorageManager.getTransactions();
    const tx = list.find(t => t.id === id);
    if (!tx) return;
    const groupKey = `${(tx.supplier || '').toLowerCase().trim()}|||${(tx.date || '').trim()}`;
    this.printDailySummary(encodeURIComponent(groupKey));
  }
};
