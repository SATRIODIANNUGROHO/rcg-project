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
    this.createDynamicStyleElement();
    this.bindEvents();
  },

  getPaperConfig(paperVal) {
    switch (paperVal) {
      case 'A6':
        return {
          cardWidth: '480px',
          padding: '14px 16px',
          fontSize: '11px',
          pageSizeCSS: '105mm 148mm',
          containerWidth: '98mm'
        };
      case 'A5':
        return {
          cardWidth: '600px',
          padding: '18px 20px',
          fontSize: '12px',
          pageSizeCSS: '148mm 210mm',
          containerWidth: '138mm'
        };
      case 'A4':
        return {
          cardWidth: '740px',
          padding: '24px 28px',
          fontSize: '13px',
          pageSizeCSS: '210mm 297mm',
          containerWidth: '190mm'
        };
      case 'Letter':
        return {
          cardWidth: '740px',
          padding: '24px 28px',
          fontSize: '13px',
          pageSizeCSS: '8.5in 11in',
          containerWidth: '7.8in'
        };
      case 'NCR_Wartel':
        return {
          cardWidth: '780px',
          padding: '18px 24px',
          fontSize: '12px',
          pageSizeCSS: '9.5in 11in',
          containerWidth: '8.8in'
        };
      default:
        return {
          cardWidth: '740px',
          padding: '20px',
          fontSize: '12px',
          pageSizeCSS: 'auto',
          containerWidth: '100%'
        };
    }
  },

  bindEvents() {
    const directPrintBtn = document.getElementById('btn-direct-print-dialog');
    if (directPrintBtn) {
      directPrintBtn.addEventListener('click', async () => {
        await this.directPrint();
      });
    }

    const confirmBtn = document.getElementById('btn-confirm-print-dialog');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        await this.downloadPdf();
      });
    }

    const paperSelect = document.getElementById('select-print-paper-size');
    if (paperSelect) {
      paperSelect.addEventListener('change', () => {
        this.refreshPreview();
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
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';
    const config = this.getPaperConfig(paperVal);

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
            <div class="preview-paper-card" style="background: #FFFFFF; color: #0F172A; width: 100%; max-width: ${config.cardWidth}; box-shadow: 0 4px 14px rgba(0,0,0,0.18); border-radius: 4px; padding: ${config.padding}; font-size: ${config.fontSize}; box-sizing: border-box; border: none !important; outline: none !important; transition: all 0.25s ease;">
              ${sheetHtml}
            </div>
          </div>
        `);
      }
      previewContainer.innerHTML = renderedCards.join('');
    } else {
      previewContainer.innerHTML = `
        <div class="preview-paper-card" style="background: #FFFFFF; color: #0F172A; width: 100%; max-width: ${config.cardWidth}; box-shadow: 0 4px 14px rgba(0,0,0,0.18); border-radius: 4px; padding: ${config.padding}; font-size: ${config.fontSize}; box-sizing: border-box; border: none !important; outline: none !important; transition: all 0.25s ease;">
          ${this.currentHtmlContent}
        </div>
      `;
    }
  },

  async directPrint() {
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';

    const copiesSelect = document.getElementById('select-print-copies');
    const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

    const finalHtml = this.getRenderedHtml(copies);

    const printableContainer = document.getElementById('printable-nota');
    if (printableContainer) {
      printableContainer.innerHTML = finalHtml || '';
    }

    this.applySelectedPrintSettings();
    App.closeModal('modal-print-settings');

    if (window.electronAPI && typeof window.electronAPI.printNota === 'function') {
      App.showToast('Membuka dialog pencetakan printer...', 'info');
      const success = await window.electronAPI.printNota({
        paperSize: paperVal,
        htmlContent: finalHtml
      });
      if (success) {
        App.showToast('Proses cetak berhasil dikirim ke printer', 'success');
      }
    } else {
      window.print();
    }
  },

  async downloadPdf() {
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';

    const copiesSelect = document.getElementById('select-print-copies');
    const copies = parseInt(copiesSelect ? copiesSelect.value : '1', 10) || 1;

    const finalHtml = this.getRenderedHtml(copies);

    const printableContainer = document.getElementById('printable-nota');
    if (printableContainer) {
      printableContainer.innerHTML = finalHtml || '';
    }

    this.applySelectedPrintSettings();

    const safeDocNo = (this.currentDocNo || 'RCG').replace(/[/\\?%*:|"<>]/g, '_');
    const filename = `${this.currentDocType}_${safeDocNo}.pdf`;

    App.closeModal('modal-print-settings');

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
      this.downloadWebDocument(filename, finalHtml, paperVal);
    }
  },

  downloadWebDocument(filename, htmlContent, paperSize = 'a4') {
    if (typeof html2pdf !== 'undefined') {
      App.showToast('Menyiapkan file PDF...', 'info');

      const config = this.getPaperConfig(paperSize);
      const tempContainer = document.createElement('div');
      tempContainer.style.background = '#FFFFFF';
      tempContainer.style.backgroundColor = '#FFFFFF';
      tempContainer.style.color = '#0F172A';
      tempContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
      tempContainer.style.padding = config.padding;
      tempContainer.style.margin = '0 auto';
      tempContainer.style.border = 'none';
      tempContainer.style.outline = 'none';
      tempContainer.style.boxShadow = 'none';
      tempContainer.style.width = config.cardWidth;
      tempContainer.innerHTML = htmlContent;

      tempContainer.querySelectorAll('img').forEach(img => {
        const rawSrc = img.getAttribute('src');
        if (rawSrc && !rawSrc.startsWith('data:') && !rawSrc.startsWith('http')) {
          img.src = new URL(rawSrc, window.location.href).href;
        }
      });

      let format = 'a4';
      if (paperSize === 'A6') format = 'a6';
      else if (paperSize === 'A5') format = 'a5';
      else if (paperSize === 'Letter') format = 'letter';
      else if (paperSize === 'NCR_Wartel') format = [241.3, 279.4];

      const opt = {
        margin: 0,
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
    const config = this.getPaperConfig(paperVal);

    if (this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl.innerHTML = `
        @media print {
          @page {
            size: ${config.pageSizeCSS} portrait !important;
            margin: 3mm !important;
          }
          #printable-nota {
            width: ${config.containerWidth} !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            overflow: hidden !important;
          }
          .nota-sheet,
          .nota-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            box-sizing: border-box !important;
          }
        }
      `;
    }
  }
};

