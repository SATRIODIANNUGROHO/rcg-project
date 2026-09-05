/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Interactive Print Settings, Paper Formats & Preview Dialog
 * Supports A6, A5, A4, Letter, and NCR Wartel 9.5" x 11" Continuous Sheet
 */

const PAPER_FORMATS = {
  A6: {
    label: 'A6 (105 x 148 mm - Standar Tiket Timbang)',
    previewWidth: '520px',
    padding: '0',
    fontSizeScale: '1',
    cssPageSize: '105mm 148mm',
    cssContainerWidth: '98mm'
  },
  A5: {
    label: 'A5 (148 x 210 mm)',
    previewWidth: '620px',
    padding: '0',
    fontSizeScale: '1',
    cssPageSize: '148mm 210mm',
    cssContainerWidth: '138mm'
  },
  A4: {
    label: 'A4 (210 x 297 mm)',
    previewWidth: '760px',
    padding: '0',
    fontSizeScale: '1',
    cssPageSize: '210mm 297mm',
    cssContainerWidth: '190mm'
  },
  Letter: {
    label: 'Letter (8.5 x 11 in)',
    previewWidth: '760px',
    padding: '0',
    fontSizeScale: '1',
    cssPageSize: '8.5in 11in',
    cssContainerWidth: '7.8in'
  },
  NCR_Wartel: {
    label: 'NCR Continuous Sheet 9.5" x 11"',
    previewWidth: '780px',
    padding: '0',
    fontSizeScale: '1',
    cssPageSize: '9.5in 11in portrait',
    cssContainerWidth: '8.8in'
  }
};

const PrintManager = {
  activePrintCallback: null,
  dynamicPrintStyleEl: null,
  currentHtmlContent: '',
  currentDocNo: '',
  currentDocType: 'Dokumen',
  currentGeneratorFn: null,

  init() {
    this.bindEvents();
    this.createDynamicStyleElement();
  },

  bindEvents() {
    // 1. Download PDF Button
    const confirmBtn = document.getElementById('btn-confirm-print-dialog');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'A6';

        const copiesSelect = document.getElementById('select-print-copies');
        const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

        // Generate full HTML with all requested copies
        const finalHtml = this.getRenderedHtml(copies);

        // Populate hidden printable area strictly for PDF generation
        const printableContainer = document.getElementById('printable-nota');
        if (printableContainer) {
          printableContainer.innerHTML = finalHtml || '';
        }

        this.applySelectedPrintSettings();

        // Prepare filename
        const safeDocNo = (this.currentDocNo || 'RCG').replace(/[/\\?%*:|"<>]/g, '_');
        const filename = `${this.currentDocType}_${safeDocNo}.pdf`;

        // Close modal preview
        App.closeModal('modal-print-settings');

        // In Electron: Save directly as crisp vector PDF using dedicated isolated offscreen renderer
        if (window.electronAPI && typeof window.electronAPI.savePDF === 'function') {
          App.showToast('Mempersiapkan dokumen PDF...', 'info');
          const result = await window.electronAPI.savePDF({
            defaultFilename: filename,
            paperSize: paperVal,
            htmlContent: finalHtml
          });

          if (result && result.success) {
            App.showToast(`Dokumen PDF berhasil diunduh: ${filename}`, 'success');
          } else if (result && !result.canceled) {
            App.showToast(`Gagal mengunduh PDF: ${result.error || 'Terjadi kesalahan'}`, 'danger');
          }
        } else {
          // Web fallback: generate and download genuine PDF document via html2pdf
          this.downloadWebDocument(filename, finalHtml, paperVal);
        }
      });
    }

    // 2. Direct Print Button ("Cetak Dokumen")
    const directPrintBtn = document.getElementById('btn-direct-print-dialog');
    if (directPrintBtn) {
      directPrintBtn.addEventListener('click', async () => {
        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'A6';

        const copiesSelect = document.getElementById('select-print-copies');
        const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

        const finalHtml = this.getRenderedHtml(copies);

        // Populate printable area
        const printableContainer = document.getElementById('printable-nota');
        if (printableContainer) {
          printableContainer.innerHTML = finalHtml || '';
        }

        this.applySelectedPrintSettings();

        // Close modal
        App.closeModal('modal-print-settings');

        if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
          try {
            await window.electronAPI.printNota({
              silent: false,
              printBackground: true,
              pageSize: paperVal
            });
          } catch (err) {
            console.error('Direct print error:', err);
            window.print();
          }
        } else {
          window.print();
        }
      });
    }

    // 3. Paper Size Change -> update preview and dynamic print style
    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      paperSelect.addEventListener('change', () => {
        this.refreshPreview();
        this.applySelectedPrintSettings();
      });
    }

    // 4. Copies Change -> update preview
    const copiesSelect = document.getElementById('select-print-copies');
    if (copiesSelect) {
      copiesSelect.addEventListener('change', () => {
        this.refreshPreview();
      });
    }
  },

  getRenderedHtml(copies = 1) {
    if (typeof this.currentGeneratorFn === 'function') {
      const sheets = [];
      for (let i = 1; i <= copies; i++) {
        sheets.push(this.currentGeneratorFn(i, copies));
      }
      return sheets.join('');
    }
    return this.currentHtmlContent || '';
  },

  refreshPreview() {
    const copiesSelect = document.getElementById('select-print-copies');
    const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';
    const formatCfg = PAPER_FORMATS[paperVal] || PAPER_FORMATS.A6;

    const previewContainer = document.getElementById('modal-print-preview-content');
    if (!previewContainer) return;

    const cardStyle = `background: #FFFFFF; color: #0F172A; width: 100%; max-width: ${formatCfg.previewWidth}; box-shadow: 0 4px 20px rgba(0,0,0,0.18); border-radius: 6px; padding: 0; box-sizing: border-box; border: 1px solid #E2E8F0; overflow: hidden; transition: max-width 0.25s ease;`;

    if (typeof this.currentGeneratorFn === 'function') {
      const renderedCards = [];
      for (let i = 1; i <= copies; i++) {
        let copyLabel = `Lembar ${i} dari ${copies}`;
        if (copies === 2) {
          copyLabel = i === 1 ? 'Lembar 1: Asli (Pemasok / Supir)' : 'Lembar 2: Arsip Kantor / Keuangan';
        } else if (copies === 3) {
          copyLabel = i === 1 ? 'Lembar 1: Asli (Pemasok / Supir)' : (i === 2 ? 'Lembar 2: Bagian Timbang & Operasional' : 'Lembar 3: Kasir & Keuangan');
        }

        const sheetHtml = this.currentGeneratorFn(i, copies);
        renderedCards.push(`
          <div class="preview-sheet-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: ${copies > 1 ? '16px' : '0'};">
            ${copies > 1 ? `<div style="font-size: 11.5px; font-weight: 600; color: #94A3B8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">— ${copyLabel} —</div>` : ''}
            <div class="preview-paper-card" style="${cardStyle}">
              ${sheetHtml}
            </div>
          </div>
        `);
      }
      previewContainer.innerHTML = renderedCards.join('');
    } else {
      previewContainer.innerHTML = `
        <div class="preview-sheet-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <div class="preview-paper-card" style="${cardStyle}">
            ${this.currentHtmlContent}
          </div>
        </div>
      `;
    }
  },

  downloadWebDocument(filename, htmlContent, paperSize = 'a4') {
    if (typeof html2pdf !== 'undefined') {
      App.showToast('Menyiapkan file PDF...', 'info');

      const formatCfg = PAPER_FORMATS[paperSize] || PAPER_FORMATS.A6;

      const tempContainer = document.createElement('div');
      tempContainer.style.background = '#FFFFFF';
      tempContainer.style.backgroundColor = '#FFFFFF';
      tempContainer.style.color = '#0F172A';
      tempContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0 auto';
      tempContainer.style.border = 'none';
      tempContainer.style.outline = 'none';
      tempContainer.style.boxShadow = 'none';
      tempContainer.style.width = formatCfg.previewWidth || '520px';
      tempContainer.style.boxSizing = 'border-box';
      tempContainer.innerHTML = htmlContent;

      // Ensure images inside tempContainer have absolute URLs
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
        margin: [3, 3, 3, 3],
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#FFFFFF' },
        jsPDF: { unit: 'mm', format: format, orientation: 'portrait' }
      };

      html2pdf().set(opt).from(tempContainer).save().then(() => {
        App.showToast(`Dokumen PDF berhasil diunduh: ${filename}`, 'success');
      }).catch(err => {
        console.error('PDF error:', err);
        App.showToast('Terjadi kendala saat membuat PDF', 'danger');
      });
    } else {
      // Direct print fallback
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

  openPrintDialog(title, contentOrGenerator, docNo = '', docType = 'Dokumen') {
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
      titleEl.textContent = title;
    }

    this.refreshPreview();
    this.applySelectedPrintSettings();
    App.openModal('modal-print-settings');
  },

  applySelectedPrintSettings() {
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';
    const formatCfg = PAPER_FORMATS[paperVal] || PAPER_FORMATS.A6;

    if (this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl.innerHTML = `
        @media print {
          @page {
            size: ${formatCfg.cssPageSize} !important;
            margin: 3mm !important;
          }
          #printable-nota {
            width: ${formatCfg.cssContainerWidth} !important;
            max-width: ${formatCfg.cssContainerWidth} !important;
            margin: 0 auto !important;
          }
          .nota-sheet,
          .nota-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 8px 10px !important;
          }
        }
      `;
    }
  }
};

