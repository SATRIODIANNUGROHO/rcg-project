/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Print Settings & On-The-Fly Paper Size Selector
 * Supports A6, A5, A4, Letter, and NCR Wartel 9.5" x 11" Continuous Sheet
 */

const PrintManager = {
  activePrintCallback: null,
  dynamicPrintStyleEl: null,

  init() {
    this.bindEvents();
    this.createDynamicStyleElement();
  },

  bindEvents() {
    const confirmBtn = document.getElementById('btn-confirm-print-dialog');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.applySelectedPrintSettings();
        App.closeModal('modal-print-settings');
        if (typeof this.activePrintCallback === 'function') {
          setTimeout(() => {
            this.activePrintCallback();
          }, 150);
        }
      });
    }
  },

  createDynamicStyleElement() {
    if (!this.dynamicPrintStyleEl) {
      this.dynamicPrintStyleEl = document.createElement('style');
      this.dynamicPrintStyleEl.id = 'dynamic-print-paper-style';
      document.head.appendChild(this.dynamicPrintStyleEl);
    }
  },

  openPrintDialog(onConfirmCallback) {
    this.activePrintCallback = onConfirmCallback;
    App.openModal('modal-print-settings');
  },

  applySelectedPrintSettings() {
    const paperSelect = document.getElementById('select-print-paper-size');
    const paperVal = paperSelect ? paperSelect.value : 'A6';

    let pageSizeCSS = 'A6 portrait';
    let containerWidth = '100%';

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
          #printable-nota-area {
            width: ${containerWidth} !important;
            margin: 0 auto !important;
          }
          .nota-sheet {
            width: ${containerWidth} !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `;
    }
  }
};
