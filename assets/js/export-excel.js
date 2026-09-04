/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Excel Report Generation (ExcelJS High-Fidelity Styled Output)
 * 100% Identical to PT Reka Cipta Garam Semua Data.xlsx Design Standard
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

    // 1. Synchronize Material Filter with HistoryManager (Transaction Context)
    const matWrap = document.getElementById('export-material-filter-wrap');
    const matSelect = document.getElementById('export-select-material');
    if (matWrap) {
      matWrap.style.display = (context === 'transaction') ? 'block' : 'none';
    }
    if (matSelect && context === 'transaction') {
      matSelect.value = (typeof HistoryManager !== 'undefined' && HistoryManager.materialFilter) || '';
      if (typeof CustomSelectManager !== 'undefined') {
        CustomSelectManager.sync(matSelect);
      }
    }

    // 2. Synchronize Supplier Filter with SupplierHistoryManager (Supplier Context)
    const suppWrap = document.getElementById('export-supplier-filter-wrap');
    const suppSelect = document.getElementById('export-select-supplier');
    if (suppWrap) {
      suppWrap.style.display = (context === 'supplier') ? 'block' : 'none';
    }
    if (suppSelect && context === 'supplier') {
      const txs = StorageManager.getTransactions();
      const suppliers = Array.from(new Set(txs.map(t => t.supplier).filter(Boolean))).sort((a, b) => a.localeCompare('id'));

      suppSelect.innerHTML = '<option value="">Semua Pemasok</option>';
      suppliers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        suppSelect.appendChild(opt);
      });

      const currentSupp = (typeof SupplierHistoryManager !== 'undefined' && SupplierHistoryManager.selectedSupplier) || '';
      if (suppliers.includes(currentSupp)) {
        suppSelect.value = currentSupp;
      } else {
        suppSelect.value = '';
      }

      if (typeof CustomSelectManager !== 'undefined') {
        CustomSelectManager.sync(suppSelect);
      }
    }

    App.openModal('modal-export-excel');
  },

  getScopedData() {
    let txs = StorageManager.getTransactions();
    const scopeEl = document.querySelector('input[name="export-scope-option"]:checked');
    const scope = scopeEl ? scopeEl.value : 'all';
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Filter by Date Scope
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

    // 2. Filter by Material Scope (Transaction Context)
    if (this.activeContext === 'transaction') {
      const exportMatSelect = document.getElementById('export-select-material');
      const selectedMat = (exportMatSelect && exportMatSelect.value !== undefined)
        ? exportMatSelect.value
        : ((typeof HistoryManager !== 'undefined' && HistoryManager.materialFilter) || '');

      if (selectedMat) {
        txs = txs.filter(t => {
          const mat = (t.material || '').trim().toLowerCase();
          const target = selectedMat.trim().toLowerCase();
          if (target === 'garam curah') {
            return mat.includes('curah');
          } else if (target === 'garam karung') {
            return mat.includes('karung');
          }
          return mat === target;
        });
      }
    }

    // 3. Filter by Supplier Scope (Supplier Context)
    if (this.activeContext === 'supplier') {
      const exportSuppSelect = document.getElementById('export-select-supplier');
      const selectedSupplier = (exportSuppSelect && exportSuppSelect.value !== undefined)
        ? exportSuppSelect.value
        : ((typeof SupplierHistoryManager !== 'undefined' && SupplierHistoryManager.selectedSupplier) || '');

      if (selectedSupplier) {
        txs = txs.filter(t => (t.supplier || '').trim().toLowerCase() === selectedSupplier.trim().toLowerCase());
      }
    }

    return txs;
  },

  getExportFileName(context = 'transaction') {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (context === 'supplier') {
      const exportSuppSelect = document.getElementById('export-select-supplier');
      const selectedSupp = (exportSuppSelect && exportSuppSelect.value)
        || ((typeof SupplierHistoryManager !== 'undefined' && SupplierHistoryManager.selectedSupplier) || '');

      if (selectedSupp) {
        const sanitized = selectedSupp.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `PT_Reka_Cipta_Garam_Rekap_Pemasok_${sanitized}_${todayStr}.xlsx`;
      }
      return `PT_Reka_Cipta_Garam_Rekap_Pemasok_${todayStr}.xlsx`;
    }

    const exportMatSelect = document.getElementById('export-select-material');
    const selectedMat = (exportMatSelect && exportMatSelect.value)
      || ((typeof HistoryManager !== 'undefined' && HistoryManager.materialFilter) || '');

    if (selectedMat) {
      const sanitized = selectedMat.replace(/[^a-zA-Z0-9_-]/g, '_');
      return `PT_Reka_Cipta_Garam_${sanitized}_${todayStr}.xlsx`;
    }
    return `PT_Reka_Cipta_Garam_Semua_Data_${todayStr}.xlsx`;
  },

  executeExport() {
    const txs = this.getScopedData();
    if (txs.length === 0) {
      App.showToast('Tidak ada data yang sesuai dengan cakupan filter yang dipilih.', 'warning');
      return;
    }

    if (this.activeContext === 'supplier') {
      this.exportSupplierExcel(txs);
    } else {
      this.exportTransactionExcel(txs);
    }
  },

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  formatDateToSlash(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  },

  // Format material string identically to template
  formatMaterialStr(t) {
    const matRaw = (t.material || '').trim();
    const isKarung = matRaw.toLowerCase().includes('karung');
    const isCurah = matRaw.toLowerCase().includes('curah');

    if (isKarung) {
      const bags = t.bagCount || 0;
      return bags > 0 ? `GARAM ${bags} KARUNG` : 'GARAM KARUNG';
    }
    if (isCurah) {
      const netKg = (t.finalNetWeight || 0).toLocaleString('id-ID');
      return netKg && netKg !== '0' ? `GARAM CURAH ${netKg} KG` : 'GARAM CURAH';
    }
    return matRaw.toUpperCase() || 'GARAM';
  },

  formatTimeString(timeStr) {
    if (!timeStr || timeStr === '-') return '-';
    return timeStr.includes('WIB') ? timeStr : `${timeStr} WIB`;
  },

  /**
   * Export Riwayat Transaksi (Design Identical to PT Reka Cipta Garam Semua Data.xlsx)
   */
  async exportTransactionExcel(txs) {
    if (typeof ExcelJS !== 'undefined') {
      try {
        const wb = new ExcelJS.Workbook();
        wb.creator = 'PT. Reka Cipta Garam';
        wb.created = new Date();

        const ws = wb.addWorksheet('Data Penimbangan', {
          views: [{ showGridLines: true }]
        });

        // 1. Define Columns with precise widths
        ws.columns = [
          { header: 'ID', key: 'id', width: 22 },
          { header: 'No Dokumen', key: 'docNo', width: 18 },
          { header: 'Tanggal', key: 'date', width: 14 },
          { header: 'Pemasok', key: 'supplier', width: 25 },
          { header: 'No Polisi', key: 'plateNo', width: 14 },
          { header: 'Material', key: 'material', width: 22 },
          { header: 'Asal Material', key: 'origin', width: 18 },
          { header: 'Jam Masuk', key: 'timeIn', width: 12 },
          { header: 'Jam Keluar', key: 'timeOut', width: 12 },
          { header: 'Berat Kotor (Kg)', key: 'gross', width: 16 },
          { header: 'Berat Tara (Kg)', key: 'tare', width: 16 },
          { header: 'Berat Muatan (Kg)', key: 'netLoad', width: 16 },
          { header: 'Refraksi (%)', key: 'refPercent', width: 12 },
          { header: 'Berat Bersih Total (Kg)', key: 'finalNet', width: 18 },
          { header: 'Berat K1 (Kg)', key: 'k1Weight', width: 16 },
          { header: 'Harga K1 / Kg', key: 'k1Price', width: 16 },
          { header: 'Total K1', key: 'k1Total', width: 18 },
          { header: 'Berat K2 (Kg)', key: 'k2Weight', width: 16 },
          { header: 'Harga K2 / Kg', key: 'k2Price', width: 16 },
          { header: 'Total K2', key: 'k2Total', width: 18 },
          { header: 'TOTAL', key: 'grandTotal', width: 22 },
          { header: 'Supir', key: 'driver', width: 14 },
          { header: 'Admin', key: 'admin', width: 14 }
        ];

        // 2. Style Header Row (Row 1) - Solid Navy Blue #0F4C81
        const headerRow = ws.getRow(1);
        headerRow.height = 26;
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F4C81' }
          };
          cell.font = {
            name: 'Calibri',
            size: 11,
            bold: true,
            color: { argb: 'FFFFFFFF' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF0F4C81' } },
            left: { style: 'thin', color: { argb: 'FF0F4C81' } },
            bottom: { style: 'thin', color: { argb: 'FF0F4C81' } },
            right: { style: 'thin', color: { argb: 'FF0F4C81' } }
          };
        });

        // 3. Populate Data Rows
        const thinBorder = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };

        txs.forEach((t) => {
          const originCombined = [t.originRegion, t.originArea].filter(Boolean).join(', ') || '-';
          const rowData = [
            t.id || '',
            t.docNo || '',
            this.formatDateToSlash(t.date),
            t.supplier || '',
            t.plateNo || '',
            this.formatMaterialStr(t),
            originCombined,
            this.formatTimeString(t.timeIn),
            this.formatTimeString(t.timeOut),
            Number(t.grossWeight) || 0,
            Number(t.tareWeight) || 0,
            Number(t.netLoadWeight) || 0,
            Number(t.refractionPercent) || 0,
            Number(t.finalNetWeight) || 0,
            Number(t.k1Weight) || 0,
            Number(t.k1Price) || 0,
            Number(t.k1Total) || 0,
            Number(t.k2Weight) || 0,
            Number(t.k2Price) || 0,
            Number(t.k2Total) || 0,
            Number(t.grandTotal) || 0,
            t.driverName || 'SUPIR',
            t.weighmasterName || t.adminName || 'AFIF'
          ];

          const addedRow = ws.addRow(rowData);
          addedRow.height = 20;

          addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } };
            cell.border = thinBorder;

            // Number formats and Alignments
            if ([10, 11, 12, 13, 14, 15, 18].includes(colNumber)) {
              cell.numFmt = '#,##0.0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([16, 19].includes(colNumber)) {
              cell.numFmt = '#,##0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([17, 20, 21].includes(colNumber)) {
              cell.numFmt = '"Rp " #,##0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([3, 5, 8, 9].includes(colNumber)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          });
        });

        // 4. AutoFilter on Header Row
        ws.autoFilter = 'A1:W1';

        // 5. Total Row with AutoSum Formulas & Pale Gold #FFF2CC Fill
        const lastDataRowIndex = ws.rowCount;
        const totalRowIndex = lastDataRowIndex + 1;
        const totalRow = ws.getRow(totalRowIndex);
        totalRow.height = 22;

        totalRow.getCell(1).value = 'TOTAL';
        totalRow.getCell(14).value = { formula: `SUM(N2:N${lastDataRowIndex})` };
        totalRow.getCell(15).value = { formula: `SUM(O2:O${lastDataRowIndex})` };
        totalRow.getCell(17).value = { formula: `SUM(Q2:Q${lastDataRowIndex})` };
        totalRow.getCell(18).value = { formula: `SUM(R2:R${lastDataRowIndex})` };
        totalRow.getCell(20).value = { formula: `SUM(T2:T${lastDataRowIndex})` };
        totalRow.getCell(21).value = { formula: `SUM(U2:U${lastDataRowIndex})` };

        for (let c = 1; c <= 23; c++) {
          const cell = totalRow.getCell(c);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF2CC' }
          };
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
            bottom: { style: 'double', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };

          if ([14, 15, 18].includes(c)) {
            cell.numFmt = '#,##0.0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if ([17, 20, 21].includes(c)) {
            cell.numFmt = '"Rp " #,##0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (c === 1) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }

        // 6. Generate & Download Buffer
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = this.getExportFileName('transaction');
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        App.showToast(`Berhasil mengekspor ${txs.length} transaksi ke Excel!`, 'success');
        return;
      } catch (err) {
        console.error('ExcelJS Export Error, falling back to SheetJS:', err);
      }
    }

    // Fallback: SheetJS
    this.fallbackSheetJSExport(txs);
  },

  /**
   * Export Rekapitulasi Pemasok (Identical Professional Navy & Pale Gold Styling)
   */
  async exportSupplierExcel(txs) {
    if (typeof ExcelJS !== 'undefined') {
      try {
        const wb = new ExcelJS.Workbook();
        wb.creator = 'PT. Reka Cipta Garam';
        wb.created = new Date();

        const ws = wb.addWorksheet('Rekapitulasi Pemasok', {
          views: [{ showGridLines: true }]
        });

        ws.columns = [
          { header: 'No', key: 'no', width: 6 },
          { header: 'Tanggal', key: 'date', width: 14 },
          { header: 'No Dokumen', key: 'docNo', width: 18 },
          { header: 'Nama Pemasok', key: 'supplier', width: 25 },
          { header: 'Kabupaten Asal', key: 'originRegion', width: 16 },
          { header: 'Desa Asal', key: 'originArea', width: 16 },
          { header: 'No Polisi', key: 'plateNo', width: 14 },
          { header: 'Berat K1 (Kg)', key: 'k1Weight', width: 16 },
          { header: 'Harga K1 / Kg', key: 'k1Price', width: 16 },
          { header: 'Total K1', key: 'k1Total', width: 18 },
          { header: 'Berat K2 (Kg)', key: 'k2Weight', width: 16 },
          { header: 'Harga K2 / Kg', key: 'k2Price', width: 16 },
          { header: 'Total K2', key: 'k2Total', width: 18 },
          { header: 'TOTAL PEMBAYARAN', key: 'grandTotal', width: 22 },
          { header: 'Status Pembayaran', key: 'status', width: 18 }
        ];

        // Style Header Row
        const headerRow = ws.getRow(1);
        headerRow.height = 26;
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F4C81' }
          };
          cell.font = {
            name: 'Calibri',
            size: 11,
            bold: true,
            color: { argb: 'FFFFFFFF' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF0F4C81' } },
            left: { style: 'thin', color: { argb: 'FF0F4C81' } },
            bottom: { style: 'thin', color: { argb: 'FF0F4C81' } },
            right: { style: 'thin', color: { argb: 'FF0F4C81' } }
          };
        });

        const thinBorder = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };

        txs.forEach((t, index) => {
          const rowData = [
            index + 1,
            this.formatDateToSlash(t.date),
            t.docNo || '',
            t.supplier || '',
            t.originRegion || '-',
            t.originArea || '-',
            t.plateNo || '',
            Number(t.k1Weight) || 0,
            Number(t.k1Price) || 0,
            Number(t.k1Total) || 0,
            Number(t.k2Weight) || 0,
            Number(t.k2Price) || 0,
            Number(t.k2Total) || 0,
            Number(t.grandTotal) || 0,
            t.paymentStatus || 'Lunas'
          ];

          const addedRow = ws.addRow(rowData);
          addedRow.height = 20;

          addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } };
            cell.border = thinBorder;

            if ([8, 11].includes(colNumber)) {
              cell.numFmt = '#,##0.0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([9, 12].includes(colNumber)) {
              cell.numFmt = '#,##0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([10, 13, 14].includes(colNumber)) {
              cell.numFmt = '"Rp " #,##0';
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else if ([1, 2, 7, 15].includes(colNumber)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          });
        });

        // AutoFilter on Header Row
        ws.autoFilter = 'A1:O1';

        // Total Row
        const lastDataRowIndex = ws.rowCount;
        const totalRowIndex = lastDataRowIndex + 1;
        const totalRow = ws.getRow(totalRowIndex);
        totalRow.height = 22;

        totalRow.getCell(1).value = 'TOTAL';
        totalRow.getCell(8).value = { formula: `SUM(H2:H${lastDataRowIndex})` };
        totalRow.getCell(10).value = { formula: `SUM(J2:J${lastDataRowIndex})` };
        totalRow.getCell(11).value = { formula: `SUM(K2:K${lastDataRowIndex})` };
        totalRow.getCell(13).value = { formula: `SUM(M2:M${lastDataRowIndex})` };
        totalRow.getCell(14).value = { formula: `SUM(N2:N${lastDataRowIndex})` };

        for (let c = 1; c <= 15; c++) {
          const cell = totalRow.getCell(c);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF2CC' }
          };
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
            bottom: { style: 'double', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };

          if ([8, 11].includes(c)) {
            cell.numFmt = '#,##0.0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if ([10, 13, 14].includes(c)) {
            cell.numFmt = '"Rp " #,##0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (c === 1) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = this.getExportFileName('supplier');
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        App.showToast(`Berhasil mengekspor ${txs.length} data pemasok ke Excel!`, 'success');
        return;
      } catch (err) {
        console.error('ExcelJS Supplier Export Error:', err);
      }
    }

    this.fallbackSheetJSExport(txs);
  },

  fallbackSheetJSExport(txs) {
    if (typeof XLSX === 'undefined') return;

    if (this.activeContext === 'supplier') {
      const rows = [
        [
          'No', 'Tanggal', 'No Dokumen', 'Nama Pemasok', 'Kabupaten Asal', 'Desa Asal',
          'No Polisi', 'Berat K1 (Kg)', 'Harga K1 / Kg', 'Total K1',
          'Berat K2 (Kg)', 'Harga K2 / Kg', 'Total K2', 'TOTAL PEMBAYARAN', 'Status Pembayaran'
        ]
      ];

      txs.forEach((t, index) => {
        rows.push([
          index + 1,
          this.formatDateToSlash(t.date),
          t.docNo || '',
          t.supplier || '',
          t.originRegion || '-',
          t.originArea || '-',
          t.plateNo || '',
          Number(t.k1Weight) || 0,
          Number(t.k1Price) || 0,
          Number(t.k1Total) || 0,
          Number(t.k2Weight) || 0,
          Number(t.k2Price) || 0,
          Number(t.k2Total) || 0,
          Number(t.grandTotal) || 0,
          t.paymentStatus || 'Lunas'
        ]);
      });

      const lastDataRow = rows.length;
      rows.push([
        'TOTAL', '', '', '', '', '', '',
        { f: `SUM(H2:H${lastDataRow})` },
        '',
        { f: `SUM(J2:J${lastDataRow})` },
        { f: `SUM(K2:K${lastDataRow})` },
        '',
        { f: `SUM(M2:M${lastDataRow})` },
        { f: `SUM(N2:N${lastDataRow})` },
        ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!autofilter'] = { ref: `A1:O${lastDataRow}` };
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi Pemasok');
      XLSX.writeFile(wb, this.getExportFileName('supplier'));
      return;
    }

    const rows = [
      [
        'ID', 'No Dokumen', 'Tanggal', 'Pemasok', 'No Polisi', 'Material', 'Asal Material',
        'Jam Masuk', 'Jam Keluar', 'Berat Kotor (Kg)', 'Berat Tara (Kg)', 'Berat Muatan (Kg)',
        'Refraksi (%)', 'Berat Bersih Total (Kg)', 'Berat K1 (Kg)', 'Harga K1 / Kg', 'Total K1',
        'Berat K2 (Kg)', 'Harga K2 / Kg', 'Total K2', 'TOTAL', 'Supir', 'Admin'
      ]
    ];

    txs.forEach(t => {
      const originCombined = [t.originRegion, t.originArea].filter(Boolean).join(', ') || '-';
      rows.push([
        t.id || '',
        t.docNo || '',
        this.formatDateToSlash(t.date),
        t.supplier || '',
        t.plateNo || '',
        this.formatMaterialStr(t),
        originCombined,
        this.formatTimeString(t.timeIn),
        this.formatTimeString(t.timeOut),
        Number(t.grossWeight) || 0,
        Number(t.tareWeight) || 0,
        Number(t.netLoadWeight) || 0,
        Number(t.refractionPercent) || 0,
        Number(t.finalNetWeight) || 0,
        Number(t.k1Weight) || 0,
        Number(t.k1Price) || 0,
        Number(t.k1Total) || 0,
        Number(t.k2Weight) || 0,
        Number(t.k2Price) || 0,
        Number(t.k2Total) || 0,
        Number(t.grandTotal) || 0,
        t.driverName || 'SUPIR',
        t.weighmasterName || t.adminName || 'AFIF'
      ]);
    });

    const lastDataRow = rows.length;
    rows.push([
      'TOTAL', '', '', '', '', '', '', '', '', '', '', '', '',
      { f: `SUM(N2:N${lastDataRow})` },
      { f: `SUM(O2:O${lastDataRow})` },
      '',
      { f: `SUM(Q2:Q${lastDataRow})` },
      { f: `SUM(R2:R${lastDataRow})` },
      '',
      { f: `SUM(T2:T${lastDataRow})` },
      { f: `SUM(U2:U${lastDataRow})` },
      '', ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!autofilter'] = { ref: `A1:W${lastDataRow}` };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Penimbangan');
    XLSX.writeFile(wb, this.getExportFileName('transaction'));
  }
};
