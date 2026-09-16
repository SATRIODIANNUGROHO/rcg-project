/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Interactive Print Settings, Physical Printer Discovery & Native PDF Live Preview
 * Two-Panel Custom Print Modal Architecture with 100% WYSIWYG Native PDF Blob URL Rendering
 */

const PAPER_FORMATS = {
  NCR_Wartel: {
    label: 'NCR Continuous 9.5" × 11"',
    specText: 'NCR Continuous 9.5" × 11" (241 × 279 mm)',
    previewWidth: '780px',
    cssPageSize: '9.5in 11in portrait',
    defaultOrientation: 'portrait',
    lockPortrait: true,
    scaleFactor: 1.888,
    scaleFactorLandscape: 1.888
  },
  A4: {
    label: 'A4 (210 × 297 mm)',
    specText: 'A4 (210 × 297 mm)',
    previewWidth: '760px',
    cssPageSize: '210mm 297mm',
    defaultOrientation: 'portrait',
    lockPortrait: false,
    scaleFactor: 2.0,
    scaleFactorLandscape: 1.414
  },
  A5: {
    label: 'A5 (148 × 210 mm)',
    specText: 'A5 (148 × 210 mm)',
    previewWidth: '620px',
    cssPageSize: '148mm 210mm',
    defaultOrientation: 'portrait',
    lockPortrait: false,
    scaleFactor: 1.414,
    scaleFactorLandscape: 1.0
  },
  A6: {
    label: 'A6 (105 × 148 mm - Standar Tiket Timbang)',
    specText: 'A6 (105 × 148 mm)',
    previewWidth: '520px',
    cssPageSize: '105mm 148mm',
    defaultOrientation: 'portrait',
    lockPortrait: false,
    scaleFactor: 1.0,
    scaleFactorLandscape: 0.71
  },
  Letter: {
    label: 'Letter (8.5 × 11 inch)',
    specText: 'Letter (8.5 × 11 in - 216 × 279 mm)',
    previewWidth: '760px',
    cssPageSize: '8.5in 11in',
    defaultOrientation: 'portrait',
    lockPortrait: false,
    scaleFactor: 1.888,
    scaleFactorLandscape: 1.45
  }
};

const MARGIN_PRESETS = {
  default: { label: 'Standar (5 mm / 0.5 cm)', mm: 5, cm: 0.5 },
  narrow: { label: 'Sempit (2 mm / 0.2 cm)', mm: 2, cm: 0.2 },
  medium: { label: 'Sedang (8 mm / 0.8 cm)', mm: 8, cm: 0.8 },
  wide: { label: 'Lebar (12 mm / 1.2 cm)', mm: 12, cm: 1.2 },
  custom: { label: 'Kustom (Atur Manual)', mm: 5, cm: 0.5 }
};

const PrintManager = {
  activePrintCallback: null,
  dynamicPrintStyleEl: null,
  currentHtmlContent: '',
  currentDocNo: '',
  currentDocType: 'Dokumen',
  currentGeneratorFn: null,
  activeBlobUrl: null,
  renderCounter: 0,
  previewDebounceTimer: null,
  isRenderingPreview: false,
  availablePrinters: [],
  autoDiscoveryTimer: null,

  marginState: {
    preset: 'default',
    unit: 'mm',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5
  },

  init() {
    this.bindEvents();
    this.createDynamicStyleElement();
    this.updateMarginControlsUI();

    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      const savedPaperSize = localStorage.getItem('rcg_print_paper_size');
      if (savedPaperSize && PAPER_FORMATS[savedPaperSize]) {
        paperSelect.value = savedPaperSize;
      } else {
        paperSelect.value = 'NCR_Wartel';
      }
      this.syncOrientationLock(paperSelect.value);
      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(paperSelect);
      }
    }

    this.fetchPrinters(false);
  },

  startAutoDiscovery() {
    this.stopAutoDiscovery();
    this.fetchPrinters(false);

    // Continuous dynamic polling for printers connected via Port (USB/Serial), Bluetooth, or Network (TCP/IP/WSD/Share)
    this.autoDiscoveryTimer = setInterval(() => {
      const modal = document.getElementById('modal-print-settings');
      if (modal && modal.classList.contains('active')) {
        this.fetchPrinters(true);
      } else {
        this.stopAutoDiscovery();
      }
    }, 2500);
  },

  stopAutoDiscovery() {
    if (this.autoDiscoveryTimer) {
      clearInterval(this.autoDiscoveryTimer);
      this.autoDiscoveryTimer = null;
    }
  },

  async fetchPrinters(silent = false) {
    const printerSelect = document.getElementById('select-print-target-device');
    if (!printerSelect) return;

    if (window.electronAPI && typeof window.electronAPI.getSystemPrinters === 'function') {
      try {
        const printers = await window.electronAPI.getSystemPrinters();
        const freshList = Array.isArray(printers) ? printers : [];

        // Check if printer list has actually changed (added, removed, or name/default changed)
        const oldSignatures = (this.availablePrinters || []).map(p => `${p.name}_${p.isDefault}`).sort().join('|');
        const newSignatures = freshList.map(p => `${p.name}_${p.isDefault}`).sort().join('|');

        if (silent && oldSignatures === newSignatures) {
          // No port, bluetooth, or network changes detected, skip DOM update
          return;
        }

        this.availablePrinters = freshList;
        const currentVal = printerSelect.value;
        printerSelect.innerHTML = '<option value="">Printer Sistem (Default Driver)</option>';

        if (this.availablePrinters.length > 0) {
          let foundSelected = false;
          this.availablePrinters.forEach(printer => {
            const opt = document.createElement('option');
            opt.value = printer.name;
            const isDef = Boolean(printer.isDefault);
            opt.textContent = `${printer.displayName || printer.name}${isDef ? ' (Default)' : ''}`;
            if (currentVal && printer.name === currentVal) {
              opt.selected = true;
              foundSelected = true;
            } else if (isDef && !currentVal) {
              opt.selected = true;
            }
            printerSelect.appendChild(opt);
          });

          if (foundSelected) {
            printerSelect.value = currentVal;
          }
        }
      } catch (err) {
        if (!silent) {
          console.error('Failed to enumerate system printers:', err);
        }
      }
    } else {
      // Running inside web browser without Electron
      printerSelect.innerHTML = '<option value="">Printer Sistem Default (Dialog Browser)</option>';
      printerSelect.disabled = true;
    }

    if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
      CustomSelectManager.sync(printerSelect);
    }
  },

  syncOrientationLock(paperSize) {
    const orientationSelect = document.getElementById('select-print-orientation');
    const ncrHint = document.getElementById('text-ncr-orientation-hint');
    const isNCR = (paperSize === 'NCR_Wartel' || paperSize === 'NCR' || paperSize === 'Continuous');

    if (orientationSelect) {
      if (isNCR) {
        orientationSelect.value = 'portrait';
        orientationSelect.disabled = true;
        if (ncrHint) {
          ncrHint.style.display = 'block';
        }
      } else {
        orientationSelect.disabled = false;
        if (ncrHint) {
          ncrHint.style.display = 'none';
        }
      }

      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(orientationSelect);
      }
    }
  },

  getMarginValues() {
    const unit = this.marginState.unit || 'mm';
    const top = Math.max(0, Number(this.marginState.top) || 0);
    const bottom = Math.max(0, Number(this.marginState.bottom) || 0);
    const left = Math.max(0, Number(this.marginState.left) || 0);
    const right = Math.max(0, Number(this.marginState.right) || 0);
    const factorToMm = (unit === 'cm') ? 10 : 1;

    return {
      preset: this.marginState.preset,
      unit: unit,
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      topMm: top * factorToMm,
      bottomMm: bottom * factorToMm,
      leftMm: left * factorToMm,
      rightMm: right * factorToMm,
      cssString: `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`
    };
  },

  updateMarginControlsUI() {
    const labelBadge = document.getElementById('label-current-margin-val');
    const panelCustom = document.getElementById('panel-custom-margins');
    const unitLabel = document.getElementById('custom-margin-unit-label');
    const presetSelect = document.getElementById('select-print-margin-preset');
    const unitSelect = document.getElementById('select-print-margin-unit');

    const topInput = document.getElementById('input-margin-top');
    const bottomInput = document.getElementById('input-margin-bottom');
    const leftInput = document.getElementById('input-margin-left');
    const rightInput = document.getElementById('input-margin-right');

    const { top, bottom, left, right, unit, preset } = this.marginState;

    if (presetSelect && presetSelect.value !== preset) {
      presetSelect.value = preset;
      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(presetSelect);
      }
    }
    if (unitSelect && unitSelect.value !== unit) {
      unitSelect.value = unit;
      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(unitSelect);
      }
    }

    if (labelBadge) {
      if (top === bottom && top === left && top === right) {
        labelBadge.textContent = `${top} ${unit}`;
      } else {
        labelBadge.textContent = `T:${top} B:${bottom} L:${left} R:${right} ${unit}`;
      }
    }

    if (unitLabel) {
      unitLabel.textContent = unit;
    }

    if (panelCustom) {
      panelCustom.style.display = (preset === 'custom') ? 'block' : 'none';
    }

    const stepVal = (unit === 'cm') ? '0.1' : '0.5';
    const maxVal = (unit === 'cm') ? '5' : '50';

    [topInput, bottomInput, leftInput, rightInput].forEach(inp => {
      if (inp) {
        inp.setAttribute('step', stepVal);
        inp.setAttribute('max', maxVal);
        inp.setAttribute('min', '0');
      }
    });

    if (topInput) topInput.value = top;
    if (bottomInput) bottomInput.value = bottom;
    if (leftInput) leftInput.value = left;
    if (rightInput) rightInput.value = right;
  },

  bindEvents() {
    // Direct Silent Print Button ("Cetak ke Printer")
    const directPrintBtn = document.getElementById('btn-direct-print-dialog');
    if (directPrintBtn) {
      directPrintBtn.addEventListener('click', async () => {
        const printerSelect = document.getElementById('select-print-target-device');
        const targetDevice = printerSelect ? printerSelect.value : '';

        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'NCR_Wartel';

        const orientationSelect = document.getElementById('select-print-orientation');
        const orientation = orientationSelect ? orientationSelect.value : 'portrait';
        const isLandscape = (paperVal === 'NCR_Wartel') ? false : (orientation === 'landscape');

        const copiesSelect = document.getElementById('select-print-copies');
        const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

        const activeScale = this.getScaleFactor(paperVal, orientation);
        const finalHtml = this.getRenderedHtml(copies, activeScale);

        const printableContainer = document.getElementById('printable-nota');
        if (printableContainer) {
          printableContainer.innerHTML = finalHtml || '';
        }

        this.applySelectedPrintSettings();
        this.cleanup();
        App.closeModal('modal-print-settings');

        if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
          App.showToast('Mengirim perintah cetak langsung ke printer...', 'info');
          try {
            const printRes = await window.electronAPI.printNota({
              silent: true,
              deviceName: targetDevice || undefined,
              pageSize: paperVal,
              landscape: isLandscape,
              copies: copies
            });

            if (printRes && printRes.success) {
              const deviceLabel = targetDevice || 'printer default';
              App.showToast(`Dokumen berhasil dicetak ke ${deviceLabel}.`, 'success');
            } else if (printRes && printRes.error) {
              App.showToast(`Gagal mencetak: ${printRes.error}`, 'danger');
            }
          } catch (err) {
            console.error('Silent direct print error:', err);
            App.showToast('Gagal memproses pencetakan langsung.', 'danger');
          }
        } else {
          window.print();
        }
      });
    }

    // 3. Download PDF Document Button ("Unduh Dokumen PDF")
    const confirmBtn = document.getElementById('btn-confirm-print-dialog');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'NCR_Wartel';

        const orientationSelect = document.getElementById('select-print-orientation');
        const orientation = orientationSelect ? orientationSelect.value : 'portrait';
        const isLandscape = (paperVal === 'NCR_Wartel') ? false : (orientation === 'landscape');

        const copiesSelect = document.getElementById('select-print-copies');
        const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

        const activeScale = this.getScaleFactor(paperVal, orientation);
        const finalHtml = this.getRenderedHtml(copies, activeScale);
        const marginValues = this.getMarginValues();

        const printableContainer = document.getElementById('printable-nota');
        if (printableContainer) {
          printableContainer.innerHTML = finalHtml || '';
        }

        this.applySelectedPrintSettings();

        const safeDocNo = (this.currentDocNo || 'RCG').replace(/[/\\?%*:|"<>]/g, '_');
        const filename = `${this.currentDocType}_${safeDocNo}.pdf`;

        this.cleanup();
        App.closeModal('modal-print-settings');

        if (window.electronAPI && typeof window.electronAPI.savePDF === 'function') {
          App.showToast('Mempersiapkan dokumen PDF...', 'info');
          const result = await window.electronAPI.savePDF({
            defaultFilename: filename,
            paperSize: paperVal,
            landscape: isLandscape,
            scaleFactor: activeScale,
            htmlContent: finalHtml,
            margins: marginValues
          });

          if (result && result.success) {
            App.showToast(`Dokumen PDF berhasil diunduh: ${filename}`, 'success');
          } else if (result && !result.canceled) {
            App.showToast(`Gagal mengunduh PDF: ${result.error || 'Terjadi kesalahan'}`, 'danger');
          }
        } else {
          this.downloadWebDocument(filename, finalHtml, paperVal, orientation, marginValues);
        }
      });
    }

    // 4. Paper Size Change
    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      paperSelect.addEventListener('change', () => {
        const val = paperSelect.value;
        try {
          localStorage.setItem('rcg_print_paper_size', val);
        } catch (e) { }

        this.syncOrientationLock(val);
        this.updateNativePdfPreview();
        this.applySelectedPrintSettings();
      });
    }

    // 5. Orientation Change
    const orientationSelect = document.getElementById('select-print-orientation');
    if (orientationSelect) {
      orientationSelect.addEventListener('change', () => {
        this.updateNativePdfPreview();
        this.applySelectedPrintSettings();
      });
    }

    // 6. Copies Change
    const copiesSelect = document.getElementById('select-print-copies');
    if (copiesSelect) {
      copiesSelect.addEventListener('change', () => {
        this.updateNativePdfPreview();
      });
    }

    // 7. Margin Preset Change
    const marginPresetSelect = document.getElementById('select-print-margin-preset');
    if (marginPresetSelect) {
      marginPresetSelect.addEventListener('change', () => {
        const selectedPreset = marginPresetSelect.value;
        this.marginState.preset = selectedPreset;

        if (selectedPreset !== 'custom') {
          const cfg = MARGIN_PRESETS[selectedPreset] || MARGIN_PRESETS.default;
          const val = cfg[this.marginState.unit] || 5;
          this.marginState.top = val;
          this.marginState.bottom = val;
          this.marginState.left = val;
          this.marginState.right = val;
        }

        this.updateMarginControlsUI();
        this.updateNativePdfPreview();
        this.applySelectedPrintSettings();
      });
    }

    // 8. Margin Unit Change (mm <-> cm)
    const marginUnitSelect = document.getElementById('select-print-margin-unit');
    if (marginUnitSelect) {
      marginUnitSelect.addEventListener('change', () => {
        const prevUnit = this.marginState.unit;
        const newUnit = marginUnitSelect.value;
        if (prevUnit === newUnit) return;

        this.marginState.unit = newUnit;

        if (this.marginState.preset !== 'custom') {
          const cfg = MARGIN_PRESETS[this.marginState.preset] || MARGIN_PRESETS.default;
          const val = cfg[newUnit] || (newUnit === 'cm' ? 0.5 : 5);
          this.marginState.top = val;
          this.marginState.bottom = val;
          this.marginState.left = val;
          this.marginState.right = val;
        } else {
          const factor = (newUnit === 'cm') ? 0.1 : 10;
          this.marginState.top = Math.round(this.marginState.top * factor * 10) / 10;
          this.marginState.bottom = Math.round(this.marginState.bottom * factor * 10) / 10;
          this.marginState.left = Math.round(this.marginState.left * factor * 10) / 10;
          this.marginState.right = Math.round(this.marginState.right * factor * 10) / 10;
        }

        this.updateMarginControlsUI();
        this.updateNativePdfPreview();
        this.applySelectedPrintSettings();
      });
    }

    // 9. Custom Margin Inputs
    const handleCustomInputChange = () => {
      const topInp = document.getElementById('input-margin-top');
      const botInp = document.getElementById('input-margin-bottom');
      const leftInp = document.getElementById('input-margin-left');
      const rightInp = document.getElementById('input-margin-right');

      this.marginState.preset = 'custom';
      this.marginState.top = topInp ? Math.max(0, parseFloat(topInp.value) || 0) : 0;
      this.marginState.bottom = botInp ? Math.max(0, parseFloat(botInp.value) || 0) : 0;
      this.marginState.left = leftInp ? Math.max(0, parseFloat(leftInp.value) || 0) : 0;
      this.marginState.right = rightInp ? Math.max(0, parseFloat(rightInp.value) || 0) : 0;

      this.updateMarginControlsUI();
      this.updateNativePdfPreview();
      this.applySelectedPrintSettings();
    };

    ['input-margin-top', 'input-margin-bottom', 'input-margin-left', 'input-margin-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', handleCustomInputChange);
        el.addEventListener('change', handleCustomInputChange);
      }
    });

    // 10. Modal Close Cleanup Watchers
    const modalPrint = document.getElementById('modal-print-settings');
    if (modalPrint) {
      modalPrint.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          this.cleanup();
        });
      });
    }
  },

  getScaleFactor(paperSize, orientation = 'portrait') {
    const isLandscape = (orientation === 'landscape');
    const fmt = PAPER_FORMATS[paperSize];
    if (fmt) {
      return isLandscape ? (fmt.scaleFactorLandscape || fmt.scaleFactor || 1.0) : (fmt.scaleFactor || 1.0);
    }
    if (paperSize === 'A4') return isLandscape ? 1.414 : 2.0;
    if (paperSize === 'A5') return isLandscape ? 1.0 : 1.414;
    if (paperSize === 'A6') return isLandscape ? 0.71 : 1.0;
    if (paperSize === 'Letter') return isLandscape ? 1.45 : 1.888;
    if (paperSize === 'NCR_Wartel') return 1.888;
    return 1.0;
  },

  getRenderedHtml(copies = 1, scaleFactor = null) {
    if (typeof this.currentGeneratorFn === 'function') {
      let activeScale = scaleFactor;
      if (activeScale === null || activeScale === undefined) {
        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'NCR_Wartel';
        const orientationSelect = document.getElementById('select-print-orientation');
        const orientation = orientationSelect ? orientationSelect.value : 'portrait';
        activeScale = this.getScaleFactor(paperVal, orientation);
      }
      const sheets = [];
      for (let i = 1; i <= copies; i++) {
        sheets.push(this.currentGeneratorFn(i, copies, activeScale));
      }
      return sheets.join('');
    }
    return this.currentHtmlContent || '';
  },

  updateNativePdfPreview(delay = 180) {
    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
    }
    this.previewDebounceTimer = setTimeout(() => {
      this.renderNativePdf();
    }, delay);
  },

  async renderNativePdf() {
    this.renderCounter = (this.renderCounter || 0) + 1;
    const currentToken = this.renderCounter;

    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'NCR_Wartel';
    const formatCfg = PAPER_FORMATS[paperVal] || PAPER_FORMATS.NCR_Wartel;

    const orientationSelect = document.getElementById('select-print-orientation');
    let orientation = orientationSelect ? orientationSelect.value : 'portrait';
    if (formatCfg.lockPortrait) {
      orientation = 'portrait';
    }
    const isLandscape = (orientation === 'landscape');

    const copiesSelect = document.getElementById('select-print-copies');
    const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

    const margins = this.getMarginValues();
    const activeScale = this.getScaleFactor(paperVal, orientation);

    // Synchronize Header Badges
    const badgePaperSpec = document.getElementById('badge-preview-paper-spec');
    if (badgePaperSpec) {
      const orientationLabel = isLandscape ? 'Landscape' : 'Portrait';
      badgePaperSpec.textContent = `${formatCfg.specText} (${orientationLabel})`;
    }

    const badgeCopies = document.getElementById('badge-preview-copies-count');
    if (badgeCopies) {
      badgeCopies.textContent = copies === 1 ? '1 Rangkap (Lembar Utama)' : (copies === 2 ? '2 Rangkap (Asli + Arsip)' : '3 Rangkap (Asli + Kantor + Supir)');
    }

    const loader = document.getElementById('print-pdf-loading-indicator');
    if (loader) {
      loader.style.display = 'flex';
    }

    const finalHtml = this.getRenderedHtml(copies, activeScale);

    // Primary Engine: Electron Offscreen Native PDF Renderer with 100% WYSIWYG Precision
    if (window.electronAPI && typeof window.electronAPI.generatePdfPreview === 'function') {
      try {
        const res = await window.electronAPI.generatePdfPreview({
          paperSize: paperVal,
          landscape: isLandscape,
          margins: margins,
          scaleFactor: activeScale,
          htmlContent: finalHtml
        });

        if (currentToken !== this.renderCounter) return;

        if (res && res.success && res.data) {
          const blob = new Blob([res.data], { type: 'application/pdf' });
          this.setPreviewBlob(blob);
          return;
        }
      } catch (err) {
        console.error('Electron generatePdfPreview error:', err);
      }
    }

    // Fallback Engine: Client-side html2pdf Blob Generation for Web Browsers
    if (typeof html2pdf !== 'undefined') {
      try {
        const tempContainer = document.createElement('div');
        tempContainer.style.background = '#FFFFFF';
        tempContainer.style.backgroundColor = '#FFFFFF';
        tempContainer.style.color = '#0F172A';
        tempContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
        tempContainer.style.padding = margins.cssString;
        tempContainer.style.margin = '0 auto';
        tempContainer.style.border = 'none';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.setProperty('--doc-scale', activeScale);
        tempContainer.innerHTML = finalHtml;

        tempContainer.querySelectorAll('.nota-container, .nota-sheet').forEach(el => {
          el.style.setProperty('--doc-scale', activeScale);
          el.style.setProperty('padding', '0', 'important');
        });

        tempContainer.querySelectorAll('img').forEach(img => {
          const rawSrc = img.getAttribute('src');
          if (rawSrc && !rawSrc.startsWith('data:') && !rawSrc.startsWith('http')) {
            img.src = new URL(rawSrc, window.location.href).href;
          }
        });

        let pdfFormat = 'a4';
        if (paperVal === 'A6') pdfFormat = 'a6';
        else if (paperVal === 'A5') pdfFormat = 'a5';
        else if (paperVal === 'Letter' || paperVal === 'NCR_Wartel') pdfFormat = 'letter';

        const opt = {
          margin: [0, 0, 0, 0],
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 1.5, useCORS: true, logging: false, backgroundColor: '#FFFFFF' },
          jsPDF: { unit: 'mm', format: pdfFormat, orientation: orientation }
        };

        const worker = html2pdf().set(opt).from(tempContainer).toPdf();
        const pdfDoc = await worker.get('pdf');

        if (currentToken !== this.renderCounter) return;

        const blob = pdfDoc.output('blob');
        this.setPreviewBlob(blob);
        return;
      } catch (err) {
        console.error('html2pdf preview rendering error:', err);
      }
    }

    if (loader) {
      loader.style.display = 'none';
    }
  },

  setPreviewBlob(blob) {
    if (this.activeBlobUrl) {
      URL.revokeObjectURL(this.activeBlobUrl);
      this.activeBlobUrl = null;
    }

    this.activeBlobUrl = URL.createObjectURL(blob);
    const iframe = document.getElementById('print-pdf-preview-iframe');
    if (iframe) {
      iframe.src = `${this.activeBlobUrl}#toolbar=0&navpanes=0&view=Fit`;
    }

    const loader = document.getElementById('print-pdf-loading-indicator');
    if (loader) {
      loader.style.display = 'none';
    }
  },

  cleanup() {
    this.stopAutoDiscovery();

    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
      this.previewDebounceTimer = null;
    }

    if (this.activeBlobUrl) {
      URL.revokeObjectURL(this.activeBlobUrl);
      this.activeBlobUrl = null;
    }

    const iframe = document.getElementById('print-pdf-preview-iframe');
    if (iframe) {
      iframe.src = 'about:blank';
    }

    const loader = document.getElementById('print-pdf-loading-indicator');
    if (loader) {
      loader.style.display = 'none';
    }
  },

  downloadWebDocument(filename, htmlContent, paperSize = 'NCR_Wartel', orientation = 'portrait', margins = null) {
    if (typeof html2pdf !== 'undefined') {
      App.showToast('Menyiapkan file PDF...', 'info');

      const formatCfg = PAPER_FORMATS[paperSize] || PAPER_FORMATS.NCR_Wartel;
      const marginValues = margins || this.getMarginValues();
      const activeScale = this.getScaleFactor(paperSize, orientation);

      const tempContainer = document.createElement('div');
      tempContainer.style.background = '#FFFFFF';
      tempContainer.style.backgroundColor = '#FFFFFF';
      tempContainer.style.color = '#0F172A';
      tempContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
      tempContainer.style.padding = marginValues.cssString;
      tempContainer.style.margin = '0 auto';
      tempContainer.style.border = 'none';
      tempContainer.style.outline = 'none';
      tempContainer.style.boxShadow = 'none';
      tempContainer.style.width = formatCfg.previewWidth || '780px';
      tempContainer.style.boxSizing = 'border-box';
      tempContainer.style.setProperty('--doc-scale', activeScale);
      tempContainer.innerHTML = htmlContent;

      tempContainer.querySelectorAll('.nota-container, .nota-sheet').forEach(el => {
        el.style.setProperty('--doc-scale', activeScale);
        el.style.setProperty('padding', '0', 'important');
      });

      tempContainer.querySelectorAll('img').forEach(img => {
        const rawSrc = img.getAttribute('src');
        if (rawSrc && !rawSrc.startsWith('data:') && !rawSrc.startsWith('http')) {
          img.src = new URL(rawSrc, window.location.href).href;
        }
      });

      let format = 'a4';
      if (paperSize === 'A6') format = 'a6';
      else if (paperSize === 'A5') format = 'a5';
      else if (paperSize === 'Letter' || paperSize === 'NCR_Wartel') format = 'letter';

      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#FFFFFF' },
        jsPDF: { unit: 'mm', format: format, orientation: orientation }
      };

      html2pdf().set(opt).from(tempContainer).save().then(() => {
        App.showToast(`Dokumen PDF berhasil diunduh: ${filename}`, 'success');
      }).catch(err => {
        console.error('PDF export error:', err);
        App.showToast('Terjadi kendala saat membuat PDF', 'danger');
      });
    } else {
      window.print();
    }
  },

  createDynamicStyleElement() {
    if (!this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl = document.createElement('style');
      this.dynamicPrintStyleEl.id = 'dynamic-print-paper-style';
      document.head.appendChild(this.dynamicPrintStyleEl);
    }
  },

  openPrintDialog(title, contentOrGenerator, docNo = '', docType = 'Dokumen', defaultPaperSize = null) {
    if (typeof contentOrGenerator === 'function') {
      this.currentGeneratorFn = contentOrGenerator;
      this.currentHtmlContent = '';
    } else {
      this.currentGeneratorFn = null;
      this.currentHtmlContent = contentOrGenerator || '';
    }

    this.currentDocNo = docNo || '';
    this.currentDocType = docType || 'Dokumen';

    const titleEl = document.getElementById('modal-print-title');
    if (titleEl && title) {
      const titleSpan = titleEl.querySelector('span');
      if (titleSpan) {
        titleSpan.textContent = title;
      } else {
        titleEl.textContent = title;
      }
    }

    // Determine and synchronize active paper size
    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      const savedPaperSize = localStorage.getItem('rcg_print_paper_size');
      const targetSize = (savedPaperSize && PAPER_FORMATS[savedPaperSize])
        ? savedPaperSize
        : ((defaultPaperSize && PAPER_FORMATS[defaultPaperSize]) ? defaultPaperSize : 'NCR_Wartel');
      paperSelect.value = targetSize;
      this.syncOrientationLock(targetSize);
      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(paperSelect);
      }
    }

    // Reset copies to 1
    const copiesSelect = document.getElementById('select-print-copies');
    if (copiesSelect) {
      copiesSelect.value = '1';
      if (typeof CustomSelectManager !== 'undefined' && typeof CustomSelectManager.sync === 'function') {
        CustomSelectManager.sync(copiesSelect);
      }
    }

    this.updateMarginControlsUI();
    this.applySelectedPrintSettings();

    App.openModal('modal-print-settings');
    this.startAutoDiscovery();
    this.updateNativePdfPreview(60);
  },

  applySelectedPrintSettings() {
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'NCR_Wartel';
    const formatCfg = PAPER_FORMATS[paperVal] || PAPER_FORMATS.NCR_Wartel;

    const orientationSelect = document.getElementById('select-print-orientation');
    let orientation = orientationSelect ? orientationSelect.value : 'portrait';
    if (formatCfg.lockPortrait) {
      orientation = 'portrait';
    }

    const margin = this.getMarginValues();
    const scale = this.getScaleFactor(paperVal, orientation);

    if (this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl.innerHTML = `
        :root {
          --doc-scale: ${scale} !important;
        }
        @media print {
          @page {
            size: ${formatCfg.cssPageSize} ${orientation};
            margin: ${margin.cssString} !important;
          }
          #printable-nota {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
          }
          .nota-sheet,
          .nota-container {
            --doc-scale: ${scale} !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `;
    }
  }
};
