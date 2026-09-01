/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Interactive Print Settings, Paper Formats & Preview Dialog
 * Supports A6, A5, A4, Letter, and NCR Wartel 9.5" x 11" Continuous Sheet
 */

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
    const confirmBtn = document.getElementById('btn-confirm-print-dialog');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const paperSelect = document.getElementById('select-print-paper-size');
        const paperVal = paperSelect ? paperSelect.value : 'A6';

        const copiesSelect = document.getElementById('select-print-copies');
        const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

        // Generate full HTML with all requested copies
        const finalHtml = this.getRenderedHtml(copies);

        // 1. Populate hidden printable area strictly for PDF generation
        const printableContainer = document.getElementById('printable-nota');
        if (printableContainer) {
          printableContainer.innerHTML = finalHtml || '';
        }

        this.applySelectedPrintSettings();

        // 2. Prepare filename
        const safeDocNo = (this.currentDocNo || 'RCG').replace(/[/\\?%*:|"<>]/g, '_');
        const filename = `${this.currentDocType}_${safeDocNo}.pdf`;

        // 3. Close modal preview
        App.closeModal('modal-print-settings');

        // 4. In Electron: Save directly as crisp vector PDF using native printToPDF without Windows print dialog
        if (window.electronAPI && typeof window.electronAPI.savePDF === 'function') {
          App.showToast('Mempersiapkan dokumen PDF...', 'info');
          const result = await window.electronAPI.savePDF({
            defaultFilename: filename,
            paperSize: paperVal
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

    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      paperSelect.addEventListener('change', () => {
        this.applySelectedPrintSettings();
      });
    }

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

    const previewContainer = document.getElementById('modal-print-preview-content');
    if (!previewContainer) return;

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
          <div class="preview-sheet-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            ${copies > 1 ? `<div style="font-size: 11.5px; font-weight: 600; color: #94A3B8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">— ${copyLabel} —</div>` : ''}
            <div style="background: #FFFFFF; color: #0F172A; width: 100%; max-width: 740px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border-radius: 4px; padding: 18px; box-sizing: border-box; border: none !important;">
              ${sheetHtml}
            </div>
          </div>
        `);
      }
      previewContainer.innerHTML = renderedCards.join('');
    } else {
      previewContainer.innerHTML = `
        <div style="background: #FFFFFF; color: #0F172A; width: 100%; max-width: 740px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); border-radius: 4px; padding: 18px; box-sizing: border-box; border: none !important;">
          ${this.currentHtmlContent}
        </div>
      `;
    }
  },

  downloadWebDocument(filename, htmlContent, paperSize = 'a4') {
    if (typeof html2pdf !== 'undefined') {
      App.showToast('Menyiapkan file PDF...', 'info');

      const tempContainer = document.createElement('div');
      tempContainer.style.background = '#FFFFFF';
      tempContainer.style.color = '#0F172A';
      tempContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
      tempContainer.style.padding = '8px';
      tempContainer.style.width = '780px';
      tempContainer.innerHTML = htmlContent;

      let format = 'a4';
      if (paperSize === 'A6') format = 'a6';
      else if (paperSize === 'A5') format = 'a5';
      else if (paperSize === 'Letter') format = 'letter';

      const opt = {
        margin: [4, 4, 4, 4],
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
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

    let pageSizeCSS = 'A6 portrait';
    let containerWidth = '98mm';

    switch (paperVal) {
      case 'A6':
        pageSizeCSS = '105mm 148mm';
        containerWidth = '98mm';
        break;
      case 'A5':
        pageSizeCSS = '148mm 210mm';
        containerWidth = '138mm';
        break;
      case 'A4':
        pageSizeCSS = '210mm 297mm';
        containerWidth = '190mm';
        break;
      case 'Letter':
        pageSizeCSS = '8.5in 11in';
        containerWidth = '7.8in';
        break;
      case 'NCR_Wartel':
        pageSizeCSS = '9.5in 11in portrait';
        containerWidth = '8.8in';
        break;
      default:
        pageSizeCSS = 'auto';
        break;
    }

    if (this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl.innerHTML = `
        @media print {
          @page {
            size: ${pageSizeCSS} !important;
            margin: 4mm !important;
          }
          #printable-nota {
            width: ${containerWidth} !important;
            margin: 0 auto !important;
          }
          .nota-sheet,
          .nota-container {
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `;
    }
  }
};
