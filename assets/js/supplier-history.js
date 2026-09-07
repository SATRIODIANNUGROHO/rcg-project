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
          <button class="btn btn-table-action action-print" style="height: 26px; padding: 0 10px; font-weight: 600; font-size: 11px; white-space: nowrap;" title="Cetak Nota Timbang" onclick="SupplierHistoryManager.printDailySummary('${encodeURIComponent(group.key)}')">
            Cetak
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
   * Print official Supplier Weighing Note / Document
   * Formatted IDENTICALLY to 'Riwayat Penimbangan' (Nota Timbang A6)
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
          copyBadgeText = 'NOTA TIMBANG (ASLI)';
          copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK / SUPIR)';
          copyFooterText = '* Lembar 1: Untuk Pemasok / Supir sebagai bukti penerimaan.';
        } else if (copyNumber === 2) {
          copyBadgeText = 'NOTA TIMBANG (LAPANGAN)';
          copyReceiverText = 'LEMBAR 2: BAGIAN TIMBANG & LAPANGAN';
          copyFooterText = '* Lembar 2: Untuk Arsip Bagian Timbangan & Lapangan.';
        } else {
          copyBadgeText = 'NOTA TIMBANG (LEMBAR 3)';
          copyReceiverText = 'LEMBAR 3: KASIR & KEUANGAN';
          copyFooterText = '* Lembar 3: Untuk Kasir & Verifikasi Pembayaran.';
        }
      }

      const firstTx = group.transactions[0] || {};
      const lastTx = group.transactions[group.transactions.length - 1] || firstTx;

      // Extract unique lists
      const plateArray = Array.from(group.plateNos || []).filter(Boolean);
      const plateSummaryFull = plateArray.join(', ') || '-';
      let plateDisplay = '-';
      if (plateArray.length === 1) {
        plateDisplay = plateArray[0];
      } else if (plateArray.length === 2) {
        plateDisplay = plateArray.join(', ');
      } else if (plateArray.length > 2) {
        plateDisplay = `${plateArray[0]} (+${plateArray.length - 1})`;
      } else {
        plateDisplay = group.txCount > 1 ? `${group.txCount} Kendaraan` : (firstTx.plateNo || '-');
      }

      const docArray = Array.from(group.docNos || []).filter(Boolean);
      const docSummaryFull = docArray.join(', ') || '-';
      const docNoDisplay = docArray.length === 1
        ? docArray[0]
        : (docArray[0] ? `${docArray[0]} (+${docArray.length - 1})` : `NOTA-${group.date}`);

      const materialArray = Array.from(group.materials || []).filter(Boolean);
      const materialsSummaryFull = materialArray.join(', ') || (group.materialsSummary || 'GARAM');
      let materialDisplay = 'GARAM';
      if (materialArray.length === 1) {
        materialDisplay = materialArray[0];
      } else if (materialArray.length === 2) {
        materialDisplay = materialArray.join(', ');
      } else if (materialArray.length > 2) {
        materialDisplay = `${materialArray[0]} (+${materialArray.length - 1})`;
      } else if (group.materialsSummary && group.materialsSummary !== '-') {
        materialDisplay = group.materialsSummary;
      }

      const driverArray = Array.from(group.drivers || []).filter(Boolean);
      const driverSummaryFull = driverArray.join(', ') || '-';
      let driverDisplay = 'SUPIR';
      if (driverArray.length === 1) {
        driverDisplay = driverArray[0];
      } else if (driverArray.length === 2) {
        driverDisplay = driverArray.join(', ');
      } else if (driverArray.length > 2) {
        driverDisplay = `${driverArray[0]} dkk.`;
      } else if (firstTx.driverName) {
        driverDisplay = firstTx.driverName;
      }

      const adminDisplay = firstTx.adminName || firstTx.weighmasterName || 'ADMIN';

      const originSummaryFull = group.originSummary || '-';
      let originDisplay = originSummaryFull;

      const timeInDisplay = firstTx.timeIn ? `${firstTx.timeIn} WIB` : '-';
      const timeOutDisplay = lastTx.timeOut ? `${lastTx.timeOut} WIB` : (firstTx.timeOut ? `${firstTx.timeOut} WIB` : '-');

      const avgK1Price = group.k1Weight > 0 ? Math.round(group.k1Total / group.k1Weight) : (firstTx.k1Price || 0);
      const avgK2Price = group.k2Weight > 0 ? Math.round(group.k2Total / group.k2Weight) : (firstTx.k2Price || 0);

      const refractionDisplay = group.transactions.length === 1
        ? `${firstTx.refractionPercent || 0}%`
        : (group.netLoadWeight > 0
            ? `${(((group.netLoadWeight - group.finalNetWeight) / group.netLoadWeight) * 100).toFixed(1)}%`
            : '0%');

      return `
        <div class="nota-container" style="background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 6px 14px; border: none !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; width: 100%; page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'};">
          <!-- Header Logo Centered -->
          <div style="text-align: center; margin-bottom: 6px;">
            <img src="assets/images/kop surat nota timbang.webp" alt="PT REKA CIPTA GARAM - Subsidiary Bawang Mas Grup" style="max-height: 42px; max-width: 100%; width: auto; height: auto; object-fit: contain; display: inline-block;">
          </div>

          <!-- Solid Theme Divider -->
          <div style="border-top: 2px solid #163A5F; margin: 0 0 6px 0;"></div>

          <!-- Title -->
          <div style="text-align: center; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; color: #163A5F;">
            ${copyBadgeText}
            ${totalCopies > 1 ? `<div style="font-size: 9px; font-weight: 700; color: #64748B; margin-top: 1px; letter-spacing: 0.03em;">[ ${copyReceiverText} ]</div>` : ''}
          </div>

          <!-- Metadata Section (2 Columns with resilient 50/50 minmax) -->
          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2px 14px; font-size: 10px; margin-bottom: 2px; line-height: 1.25; width: 100%; box-sizing: border-box;">
            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Tanggal</div>
              <div style="color: #0F172A; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${group.date}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">No. Polisi</div>
              <div style="color: #0F172A; font-weight: 700; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${plateSummaryFull} (${plateArray.length} Kendaraan)">${plateDisplay}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Material</div>
              <div style="color: #0F172A; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${materialsSummaryFull}">${materialDisplay}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Masuk</div>
              <div style="color: #0F172A; font-weight: 500; font-size: 9.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${timeInDisplay}</div>
            </div>

            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">No. Dok</div>
              <div style="color: #0F172A; font-weight: 700; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${docSummaryFull}">${docNoDisplay}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Nama Pemasok</div>
              <div style="color: #0F172A; font-weight: 700; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${group.supplier}">${group.supplier}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Asal Material</div>
              <div style="color: #0F172A; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${originSummaryFull}">${originDisplay}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Keluar</div>
              <div style="color: #0F172A; font-weight: 500; font-size: 9.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${timeOutDisplay}</div>
            </div>
          </div>

          <!-- Dashed Divider 1 -->
          <div style="border-top: 1px dashed #94A3B8; margin: 4px 0;"></div>

          <!-- Weight Section (2 Columns with resilient 50/50 minmax) -->
          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2px 14px; font-size: 10px; margin-bottom: 2px; line-height: 1.25; width: 100%; box-sizing: border-box;">
            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Kotor (Gross)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.grossWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Muatan (Bruto)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.netLoadWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Bersih Total (Kg)</div>
              <div style="color: #163A5F; font-weight: 800; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.finalNetWeight || 0).toLocaleString('id-ID')} Kg</div>
            </div>

            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Tara (Tare)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.tareWeight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Refraksi (%)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${refractionDisplay}</div>
            </div>
          </div>

          <!-- Dashed Divider 2 -->
          <div style="border-top: 1px dashed #94A3B8; margin: 4px 0;"></div>

          <!-- Quality & Price Section (2 Columns with resilient 50/50 minmax) -->
          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2px 14px; font-size: 10px; margin-bottom: 2px; line-height: 1.25; width: 100%; box-sizing: border-box;">
            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Bersih K1 (Kg)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.k1Weight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Berat Bersih K2 (Kg)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(group.k2Weight || 0).toLocaleString('id-ID')} Kg</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Total K1 (Rp)</div>
              <div style="color: #163A5F; font-weight: 700; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Rp ${(group.k1Total || 0).toLocaleString('id-ID')}</div>
            </div>

            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Harga K1 / Kg (Rp)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Rp ${(avgK1Price || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Harga K2 / Kg (Rp)</div>
              <div style="color: #0F172A; font-weight: 600; font-family: monospace; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Rp ${(avgK2Price || 0).toLocaleString('id-ID')}</div>

              <div style="font-weight: 700; color: #475569; font-size: 9.5px; margin-bottom: 1px;">Total K2 (Rp)</div>
              <div style="color: #B45309; font-weight: 700; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Rp ${(group.k2Total || 0).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <!-- Total Keseluruhan (Thematic Accent Box) -->
          <div style="margin-top: 5px; background: #F8FAFC; border-left: 3px solid #163A5F; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 4px 8px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
            <span style="font-weight: 800; font-size: 9.5px; color: #1E293B; text-transform: uppercase; letter-spacing: 0.03em;">TOTAL KESELURUHAN:</span>
            <span style="font-weight: 800; font-size: 11.5px; color: #163A5F; font-family: monospace;">Rp ${(group.grandTotal || 0).toLocaleString('id-ID')}</span>
          </div>

          <!-- Signatures (2 Columns with resilient 50/50 minmax) -->
          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); text-align: center; margin-top: 12px; font-size: 9.5px; width: 100%; box-sizing: border-box;">
            <div style="min-width: 0; overflow: hidden; padding: 0 4px;">
              <div style="color: #64748B; margin-bottom: 22px;">Supir Kendaraan</div>
              <div style="font-weight: 700; color: #0F172A; text-transform: uppercase; display: inline-block; border-top: 1px solid #64748B; min-width: 90px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-top: 2px;" title="${driverSummaryFull}">( ${driverDisplay} )</div>
            </div>
            <div style="min-width: 0; overflow: hidden; padding: 0 4px;">
              <div style="color: #64748B; margin-bottom: 22px;">Petugas / Admin</div>
              <div style="font-weight: 700; color: #0F172A; text-transform: uppercase; display: inline-block; border-top: 1px solid #64748B; min-width: 90px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-top: 2px;">( ${adminDisplay} )</div>
            </div>
          </div>

          <!-- Footer Note -->
          ${totalCopies > 1 ? `
            <div style="font-size: 8px; color: #64748B; text-align: center; margin-top: 8px; border-top: 1px dotted #CBD5E1; padding-top: 2px;">
              ${copyFooterText}
            </div>
          ` : ''}
        </div>
      `;
    };

    const docIdentifier = group.docNos[0] || `NOTA-${group.supplier.replace(/[^a-zA-Z0-9]/g, '_')}-${group.date}`;

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog('Pratinjau Cetak Nota Timbang', generatorFn, docIdentifier, 'Nota_Timbang', 'A6');
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
