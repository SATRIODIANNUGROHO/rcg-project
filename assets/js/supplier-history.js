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
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
        this.render();
      });
      searchInput.addEventListener('focus', () => {
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
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
          this.combobox.close();
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
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
        this.render();
      });
    }

    const sortSelect = document.getElementById('supplier-history-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOrder = e.target.value;
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
        this.render();
      });
    }

    const pageSizeSelect = document.getElementById('supplier-history-page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10) || 10;
        this.currentPage = 1;
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
        this.render();
      });
    }

    const prevBtn = document.getElementById('supplier-history-prev-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
        }
      });
    }

    const nextBtn = document.getElementById('supplier-history-next-page');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.combobox && this.combobox.close) {
          this.combobox.close();
        }
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
      let statusBadgeClass = 'badge-warning';

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

    const canChangePay = typeof AuthManager !== 'undefined' ? AuthManager.canChangePaymentStatus() : true;

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
          <button class="badge ${group.statusBadgeClass}" style="${canChangePay ? 'cursor: pointer;' : 'cursor: default; opacity: 0.9;'} border: 1px solid; height: 26px; padding: 0 10px; font-weight: 600; white-space: nowrap; font-size: 11px;" ${canChangePay ? `onclick="SupplierHistoryManager.togglePaymentStatus('${encodeURIComponent(group.key)}')"` : ''} title="${canChangePay ? 'Klik untuk mengubah status pembayaran' : 'Status Pembayaran (Read-Only)'}">
            ${group.paymentStatus}
          </button>
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
    if (typeof TransactionEngine !== 'undefined' && typeof TransactionEngine.formatMaterialDisplay === 'function') {
      return TransactionEngine.formatMaterialDisplay(tx);
    }
    if (!tx) return 'GARAM';
    const mat = (tx.material || '').trim();
    const bagCount = parseInt(tx.bagCount, 10) || 0;
    const finalNet = parseFloat(tx.finalNetWeight) || 0;

    const upper = mat.toUpperCase();
    const isCurah = upper.includes('CURAH');

    if (/\d+/.test(upper)) {
      if (upper.includes('KARUNG') || upper.includes('KG') || upper.includes('TON')) {
        return upper;
      }
      return isCurah ? `${upper} KG` : `${upper} KARUNG`;
    }

    if (isCurah) {
      if (finalNet > 0) {
        const formattedNet = (finalNet % 1 === 0) ? finalNet.toFixed(1) : (Math.round(finalNet * 10) / 10).toFixed(1);
        return `GARAM CURAH ${formattedNet} KG`;
      }
      if (bagCount > 0) {
        return `GARAM CURAH ${bagCount.toFixed(1)} KG`;
      }
      return 'GARAM CURAH';
    } else {
      if (bagCount > 0) {
        return `GARAM ${bagCount} KARUNG`;
      }
      return 'GARAM KARUNG';
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

    const generatorFn = (copyNumber, totalCopies, scale) => this.generateRekapHtml(group, copyNumber, totalCopies, scale);
    const docIdentifier = `REKAP-${group.supplier.replace(/[^a-zA-Z0-9]/g, '_')}-${group.date}`;

    if (typeof PrintManager !== 'undefined') {
      PrintManager.openPrintDialog('Pratinjau Cetak Rekapitulasi Pemasok', generatorFn, docIdentifier, 'Rekap_Pemasok');
    } else {
      const container = document.getElementById('printable-nota');
      if (container) container.innerHTML = generatorFn(1, 1, 1.0);
      window.print();
    }
  },

  generateRekapHtml(group, copyNumber = 1, totalCopies = 1, scaleFactor = null) {
    let copyBadgeText = 'R E K A P I T U L A S I &nbsp;&nbsp; P E M A S O K';
    let copyReceiverText = 'LEMBAR REKAP HARIAN';

    if (totalCopies === 2) {
      if (copyNumber === 1) {
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK)';
      } else {
        copyReceiverText = 'LEMBAR 2: ARSIP KANTOR / KEUANGAN';
      }
    } else if (totalCopies === 3) {
      if (copyNumber === 1) {
        copyReceiverText = 'LEMBAR 1: ASLI (PEMASOK)';
      } else if (copyNumber === 2) {
        copyReceiverText = 'LEMBAR 2: BAGIAN TIMBANG & LAPANGAN';
      } else {
        copyReceiverText = 'LEMBAR 3: KASIR & KEUANGAN';
      }
    }

    const firstTx = (group.transactions && group.transactions[0]) || {};
    const lastTx = (group.transactions && group.transactions[group.transactions.length - 1]) || firstTx;

    // Format Indonesian date (e.g. 5 September 2026)
    let formattedDate = group.date || '-';
    if (group.date && group.date.includes('-')) {
      const parts = group.date.split('-');
      if (parts.length === 3) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parts[0];
        if (months[m]) {
          formattedDate = `${d} ${months[m]} ${y}`;
        }
      }
    }

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
      : (docArray[0] ? `${docArray[0]} (+${docArray.length - 1})` : `REKAP-${group.date}`);

    // Material segregation: Bagged vs Curah
    let totalKarung = 0;
    let totalCurahKg = 0;
    (group.transactions || []).forEach(tx => {
      const upperMat = (tx.material || '').trim().toUpperCase();
      const isCurah = upperMat.includes('CURAH');
      const bagCount = parseInt(tx.bagCount, 10) || 0;
      const net = parseFloat(tx.finalNetWeight) || parseFloat(tx.netLoadWeight) || 0;

      if (isCurah) {
        totalCurahKg += net;
      } else {
        totalKarung += bagCount;
      }
    });

    if (totalKarung === 0 && group.bagCount > 0) {
      totalKarung = group.bagCount;
    }

    const curahFormatted = (totalCurahKg % 1 === 0)
      ? totalCurahKg.toLocaleString('en-US')
      : totalCurahKg.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const adminDisplay = firstTx.weighmasterName || firstTx.adminName || 'PENJAGA TIMBANGAN';
    const originSummaryFull = group.originSummary || '-';
    let originDisplay = originSummaryFull;

    const timeInDisplay = firstTx.timeIn ? `${firstTx.timeIn} WIB` : '-';
    const timeOutDisplay = lastTx.timeOut ? `${lastTx.timeOut} WIB` : (firstTx.timeOut ? `${firstTx.timeOut} WIB` : '-');

    const avgK1Price = group.k1Weight > 0 ? Math.round(group.k1Total / group.k1Weight) : (firstTx.k1Price || 0);
    const avgK2Price = group.k2Weight > 0 ? Math.round(group.k2Total / group.k2Weight) : (firstTx.k2Price || 0);

    const calculatedRefraction = group.netLoadWeight > 0
      ? (((group.netLoadWeight - group.finalNetWeight) / group.netLoadWeight) * 100)
      : (firstTx.refractionPercent || 0);
    const refractionDisplay = `${Number(calculatedRefraction).toFixed(1)} %`;

    const isAllLunas = (group.unpaidCount === 0 && group.lunasCount > 0);
    const statusRekapDisplay = isAllLunas ? 'LUNAS' : (group.paymentStatus ? group.paymentStatus.toUpperCase() : 'BELUM LUNAS');

    // Adapt scaleFactor for A4-based Rekap layout (fallback from A6 scale if necessary)
    let activeScale = (scaleFactor !== null && scaleFactor !== undefined) ? scaleFactor : 1.0;
    if (activeScale > 1.2) {
      activeScale = activeScale / 2.0;
    }
    const scaleCssProp = `--doc-scale: ${activeScale};`;

    return `
      <div class="nota-container rekap-container" style="${scaleCssProp} display: flex; flex-direction: column; justify-content: space-between; height: var(--printable-height, 100%); min-height: var(--printable-height, 100%); max-height: var(--printable-height, 100%); box-sizing: border-box; background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 0; border: none !important; outline: none !important; box-shadow: none !important; width: 100%; overflow: hidden; page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: ${copyNumber < totalCopies ? 'always' : 'auto'}; break-after: ${copyNumber < totalCopies ? 'page' : 'auto'};">
        <!-- Top Section Block -->
        <div class="rekap-top-block" style="width: 100%; flex-shrink: 0;">
          <!-- Official Kop Surat PT Reka Cipta Garam - Subsidiary Bawang Mas Grup (~5:1 aspect ratio) -->
          <div class="rekap-header-area" style="width: 100%; text-align: center; margin-bottom: calc(6px * var(--doc-scale, 1));">
            <div style="text-align: center; margin-bottom: calc(4px * var(--doc-scale, 1));">
              <img class="nota-logo" src="assets/images/kop surat nota timbang.webp" alt="PT REKA CIPTA GARAM - Subsidiary Bawang Mas Grup" style="max-height: calc(60px * var(--doc-scale, 1)); max-width: 100%; width: auto; height: auto; object-fit: contain; display: inline-block;">
            </div>
            <div style="border-top: calc(1px * var(--doc-scale, 1)) solid #0B2545; margin: 0 0 calc(10px * var(--doc-scale, 1)) 0;"></div>
            <div style="text-align: center; font-size: calc(15px * var(--doc-scale, 1)); font-weight: 800; letter-spacing: calc(3px * var(--doc-scale, 1)); text-transform: uppercase; color: #0B2545; line-height: 1.25;">
              ${copyBadgeText}
              ${totalCopies > 1 ? `<div style="font-size: calc(9px * var(--doc-scale, 1)); font-weight: 700; color: #64748B; margin-top: calc(2px * var(--doc-scale, 1)); letter-spacing: 0.05em;">[ ${copyReceiverText} ]</div>` : ''}
            </div>
          </div>

          <!-- Seksi 1: DATA REKAPITULASI PEMASOK (Clean borderless 2-column grid with aligned colons) -->
          <div class="rekap-section" style="width: 100%; margin-bottom: calc(10px * var(--doc-scale, 1));">
            <div style="font-size: calc(11px * var(--doc-scale, 1)); font-weight: 800; color: #0B2545; text-transform: uppercase; letter-spacing: calc(2px * var(--doc-scale, 1)); margin-bottom: calc(6px * var(--doc-scale, 1));">
              D A T A &nbsp;&nbsp; R E K A P I T U L A S I &nbsp;&nbsp; P E M A S O K
            </div>
            <table style="width: 100%; border-collapse: collapse; border: none; table-layout: fixed; margin-bottom: 0; font-size: calc(10.5px * var(--doc-scale, 1)); line-height: 1.4;">
              <tbody>
                <tr>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Tanggal Rekap</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${formattedDate}</td>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Jumlah Transaksi</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${group.txCount} Transaksi</td>
                </tr>
                <tr>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Pemasok</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${group.supplier}">${group.supplier}</td>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">No. Dokumen</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${docSummaryFull}">${docNoDisplay}</td>
                </tr>
                <tr>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Asal Material</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${originSummaryFull}">${originDisplay}</td>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Nomor Polisi</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${plateSummaryFull}">${plateDisplay}</td>
                </tr>
                <tr>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Waktu Operasional</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: #0F172A; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${timeInDisplay} s/d ${timeOutDisplay}</td>
                  <td style="width: 20%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 400; color: #0F172A; vertical-align: top;">Status Rekap</td>
                  <td style="width: 2%; padding: calc(3px * var(--doc-scale, 1)) 0; border: none; font-weight: 800; color: #0B2545; text-align: center; vertical-align: top;">:</td>
                  <td style="width: 28%; padding: calc(3px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: none; font-weight: 800; color: ${isAllLunas ? '#0B2545' : '#B45309'}; vertical-align: top; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: uppercase;">${statusRekapDisplay}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Seksi 2: RINCIAN MATERIAL (#0B2545 Navy Header, Bagged vs Bulk distinction) -->
          <div class="rekap-section" style="width: 100%; margin-bottom: calc(10px * var(--doc-scale, 1));">
            <div style="font-size: calc(11px * var(--doc-scale, 1)); font-weight: 800; color: #0B2545; text-transform: uppercase; letter-spacing: calc(2px * var(--doc-scale, 1)); margin-bottom: calc(6px * var(--doc-scale, 1));">
              R I N C I A N &nbsp;&nbsp; M A T E R I A L
            </div>
            <table style="width: 100%; border-collapse: collapse; border: calc(1px * var(--doc-scale, 1)) solid #0B2545; margin-bottom: 0; font-size: calc(10.5px * var(--doc-scale, 1));">
              <thead>
                <tr style="background-color: #0B2545; color: #FFFFFF;">
                  <th style="width: 50%; padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center; letter-spacing: calc(1.5px * var(--doc-scale, 1)); text-transform: uppercase;">D E S K R I P S I &nbsp;&nbsp; M A T E R I A L</th>
                  <th style="width: 50%; padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center; letter-spacing: calc(1.5px * var(--doc-scale, 1)); text-transform: uppercase;">T O T A L &nbsp;&nbsp; K U A N T I T A S</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #FFFFFF;">
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">GARAM KARUNG</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">${totalKarung.toLocaleString('en-US')} KARUNG</td>
                </tr>
                <tr style="background: #FFFFFF;">
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">GARAM CURAH</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(8px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">${curahFormatted} KG</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Seksi 3: NOTA TIMBANG & REFRAKSI (5 Columns with #0B2545 Navy Header) -->
          <div class="rekap-section" style="width: 100%; margin-bottom: calc(10px * var(--doc-scale, 1));">
            <div style="font-size: calc(11px * var(--doc-scale, 1)); font-weight: 800; color: #0B2545; text-transform: uppercase; letter-spacing: calc(2px * var(--doc-scale, 1)); margin-bottom: calc(6px * var(--doc-scale, 1));">
              N O T A &nbsp;&nbsp; T I M B A N G &nbsp;&nbsp; &amp; &nbsp;&nbsp; R E F R A K S I
            </div>
            <table style="width: 100%; border-collapse: collapse; border: calc(1px * var(--doc-scale, 1)) solid #0B2545; margin-bottom: 0; font-size: calc(10.5px * var(--doc-scale, 1));">
              <thead>
                <tr style="background-color: #0B2545; color: #FFFFFF;">
                  <th style="width: 20%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Kotor (Gross)</th>
                  <th style="width: 20%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Tara</th>
                  <th style="width: 20%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Muatan (Bruto)</th>
                  <th style="width: 20%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Refraksi</th>
                  <th style="width: 20%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Total Bersih (Netto)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #FFFFFF;">
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.grossWeight || 0).toLocaleString('en-US')} Kg</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.tareWeight || 0).toLocaleString('en-US')} Kg</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.netLoadWeight || 0).toLocaleString('en-US')} Kg</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${refractionDisplay}</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.finalNetWeight || 0).toLocaleString('en-US')} Kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Seksi 4: RINCIAN PERHITUNGAN & PEMBAYARAN (Comparison of Kualitas 1 and Kualitas 2 + Total Payment Banner) -->
          <div class="rekap-section" style="width: 100%; margin-bottom: 0;">
            <div style="font-size: calc(11px * var(--doc-scale, 1)); font-weight: 800; color: #0B2545; text-transform: uppercase; letter-spacing: calc(2px * var(--doc-scale, 1)); margin-bottom: calc(6px * var(--doc-scale, 1));">
              R I N C I A N &nbsp;&nbsp; P E R H I T U N G A N &nbsp;&nbsp; &amp; &nbsp;&nbsp; P E M B A Y A R A N
            </div>
            <table style="width: 100%; border-collapse: collapse; border: calc(1px * var(--doc-scale, 1)) solid #0B2545; margin-bottom: 0; font-size: calc(10.5px * var(--doc-scale, 1));">
              <thead>
                <tr style="background-color: #0B2545; color: #FFFFFF;">
                  <th style="width: 25%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Jenis Kualitas</th>
                  <th style="width: 25%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Berat Bersih</th>
                  <th style="width: 25%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Harga Per Kilo</th>
                  <th style="width: 25%; padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #0B2545; font-weight: 800; text-align: center;">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #FFFFFF;">
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">Kualitas 1</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.k1Weight || 0).toLocaleString('en-US')} Kg</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">Rp${(avgK1Price || 0).toLocaleString('en-US')}</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">Rp${(group.k1Total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background: #FFFFFF;">
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(6px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: left;">Kualitas 2</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">${(group.k2Weight || 0).toLocaleString('en-US')} Kg</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">Rp${(avgK2Price || 0).toLocaleString('en-US')}</td>
                  <td style="padding: calc(6px * var(--doc-scale, 1)) calc(4px * var(--doc-scale, 1)); border: calc(1px * var(--doc-scale, 1)) solid #CBD5E1; font-weight: 400; color: #0F172A; text-align: center;">Rp${(group.k2Total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            <!-- Full Width Deep Navy Payment Total Banner directly joined below Table 4 -->
            <div style="background-color: #0B2545; color: #FFFFFF; font-weight: 800; font-size: calc(11px * var(--doc-scale, 1)); letter-spacing: calc(1.5px * var(--doc-scale, 1)); padding: calc(7px * var(--doc-scale, 1)) calc(10px * var(--doc-scale, 1)); text-align: left; border: calc(1px * var(--doc-scale, 1)) solid #0B2545; border-top: none; margin-bottom: 0; box-sizing: border-box;">
              T O T A L &nbsp;&nbsp; P E M B A Y A R A N &nbsp;&nbsp; : &nbsp; Rp${(group.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <!-- Seksi 5: PENGESAHAN (Two center-aligned columns + Footnote anchored at bottom) -->
        <div class="rekap-bottom-block" style="width: 100%; margin-top: auto; flex-shrink: 0; padding-top: calc(10px * var(--doc-scale, 1));">
          <div style="font-size: calc(11px * var(--doc-scale, 1)); font-weight: 800; color: #0B2545; text-transform: uppercase; letter-spacing: calc(2px * var(--doc-scale, 1)); margin-bottom: calc(8px * var(--doc-scale, 1)); text-align: left;">
            P E N G E S A H A N
          </div>
          <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: calc(6px * var(--doc-scale, 1));">
            <tbody>
              <tr>
                <td style="width: 50%; text-align: center; border: none; vertical-align: top; padding: 0 calc(15px * var(--doc-scale, 1));">
                  <div style="font-weight: 800; color: #0B2545; font-size: calc(11px * var(--doc-scale, 1)); margin-bottom: calc(52px * var(--doc-scale, 1));">Pemasok</div>
                  <div style="border-top: calc(1px * var(--doc-scale, 1)) solid #000000; width: 60%; margin: 0 auto calc(4px * var(--doc-scale, 1)) auto;"></div>
                  <div style="font-weight: 800; color: #0F172A; font-size: calc(11px * var(--doc-scale, 1)); text-transform: uppercase;">${group.supplier.toUpperCase()}</div>
                </td>
                <td style="width: 50%; text-align: center; border: none; vertical-align: top; padding: 0 calc(15px * var(--doc-scale, 1));">
                  <div style="font-weight: 800; color: #0B2545; font-size: calc(11px * var(--doc-scale, 1)); margin-bottom: calc(52px * var(--doc-scale, 1));">Penjaga Timbangan</div>
                  <div style="border-top: calc(1px * var(--doc-scale, 1)) solid #000000; width: 60%; margin: 0 auto calc(4px * var(--doc-scale, 1)) auto;"></div>
                  <div style="font-weight: 800; color: #0F172A; font-size: calc(11px * var(--doc-scale, 1)); text-transform: uppercase;">${adminDisplay.toUpperCase()}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="border-top: calc(0.8px * var(--doc-scale, 1)) solid #94A3B8; margin: calc(10px * var(--doc-scale, 1)) 0 calc(3px * var(--doc-scale, 1)) 0;"></div>
          <div style="text-align: center; font-style: italic; font-weight: 400; color: #334155; font-size: calc(8.5px * var(--doc-scale, 1)); line-height: 1.3;">
            Dokumen ini merupakan bukti sah penerimaan &amp; penimbangan garam PT. Reka Cipta Garam.
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Toggle payment status for an aggregated supplier group (all member transactions)
   */
  togglePaymentStatus(encodedKey) {
    if (typeof AuthManager !== 'undefined' && !AuthManager.canChangePaymentStatus()) {
      App.showToast('Akun Anda tidak memiliki hak akses untuk mengubah status pembayaran transaksi!', 'warning');
      return;
    }
    const key = decodeURIComponent(encodedKey);
    const groups = this.getGroupedData();
    const group = groups.find(g => g.key === key);
    if (!group || !group.transactions || group.transactions.length === 0) return;

    // Toggle: if currently all are Lunas, switch to Belum Lunas; otherwise switch all to Lunas
    const isAllLunas = (group.unpaidCount === 0 && group.lunasCount > 0);
    const newStatus = isAllLunas ? 'Belum Lunas' : 'Lunas';

    group.transactions.forEach(tx => {
      tx.paymentStatus = newStatus;
      StorageManager.saveTransaction(tx);
    });

    StorageManager.addLog(
      AuthManager.getCurrentUser().username,
      AuthManager.getCurrentUser().role,
      `Ubah Status Bayar Pemasok ${group.supplier} (${group.date}) 🠊 ${newStatus} (${group.transactions.length} Transaksi)`,
      group.docNos[0] || '-'
    );

    App.showToast(`Status pembayaran pemasok ${group.supplier} (${group.date}) diubah menjadi ${newStatus}.`, 'success');
    this.render();
    if (typeof HistoryManager !== 'undefined' && typeof HistoryManager.render === 'function') {
      HistoryManager.render();
    }
    if (typeof App !== 'undefined' && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
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
