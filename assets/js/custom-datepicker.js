/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Custom Datepicker Component
 * Translates native date inputs into sleek, fully theme-styled custom calendar popups
 */

const CustomDatePicker = {
  MONTH_NAMES_ID: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ],
  DAY_NAMES_SHORT: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],

  init() {
    this.enhanceAll();
    this.bindGlobalEvents();
  },

  enhanceAll() {
    document.querySelectorAll('input[type="date"]').forEach(input => {
      this.enhance(input);
    });
  },

  enhance(input) {
    if (!input || input.dataset.customDateEnhanced === 'true') return;
    input.dataset.customDateEnhanced = 'true';
    input.style.display = 'none';

    // Container
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-datepicker-container';
    if (input.style.width) wrapper.style.width = input.style.width;
    if (input.style.minWidth) wrapper.style.minWidth = input.style.minWidth;
    if (input.style.maxWidth) wrapper.style.maxWidth = input.style.maxWidth;
    if (input.style.flex) wrapper.style.flex = input.style.flex;
    wrapper.id = `datepicker-wrapper-${input.id || Math.random().toString(36).substr(2, 9)}`;

    // Custom Trigger Input
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-datepicker-trigger';
    if (input.classList.contains('form-control-sm')) {
      trigger.classList.add('custom-datepicker-sm');
    }

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-datepicker-text';
    textSpan.textContent = this.formatDateDisplay(input.value);
    trigger.appendChild(textSpan);

    // Calendar Icon (SVG)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'custom-datepicker-icon';
    iconSpan.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    `;
    trigger.appendChild(iconSpan);

    // Floating Calendar Popup
    const popup = document.createElement('div');
    popup.className = 'dropdown-menu-card custom-datepicker-popup';

    // State
    const now = new Date();
    let currentViewYear = now.getFullYear();
    let currentViewMonth = now.getMonth();

    if (input.value) {
      const parts = input.value.split('-');
      if (parts.length === 3) {
        currentViewYear = parseInt(parts[0], 10);
        currentViewMonth = parseInt(parts[1], 10) - 1;
      }
    }

    const renderCalendar = () => {
      popup.innerHTML = '';

      // Header
      const header = document.createElement('div');
      header.className = 'datepicker-header';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'btn-datepicker-nav';
      prevBtn.title = 'Bulan Sebelumnya';
      prevBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 448 512" fill="currentColor">
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
      `;
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentViewMonth--;
        if (currentViewMonth < 0) {
          currentViewMonth = 11;
          currentViewYear--;
        }
        renderCalendar();
      });

      const titleSpan = document.createElement('div');
      titleSpan.className = 'datepicker-title';
      titleSpan.textContent = `${this.MONTH_NAMES_ID[currentViewMonth]} ${currentViewYear}`;

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn-datepicker-nav';
      nextBtn.title = 'Bulan Berikutnya';
      nextBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 448 512" fill="currentColor">
          <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
        </svg>
      `;
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentViewMonth++;
        if (currentViewMonth > 11) {
          currentViewMonth = 0;
          currentViewYear++;
        }
        renderCalendar();
      });

      header.appendChild(prevBtn);
      header.appendChild(titleSpan);
      header.appendChild(nextBtn);
      popup.appendChild(header);

      // Weekday Header Row
      const weekdaysGrid = document.createElement('div');
      weekdaysGrid.className = 'datepicker-weekdays';
      this.DAY_NAMES_SHORT.forEach(day => {
        const dayCell = document.createElement('div');
        dayCell.className = 'datepicker-weekday';
        dayCell.textContent = day;
        weekdaysGrid.appendChild(dayCell);
      });
      popup.appendChild(weekdaysGrid);

      // Days Grid
      const daysGrid = document.createElement('div');
      daysGrid.className = 'datepicker-days';

      const firstDayOfMonth = new Date(currentViewYear, currentViewMonth, 1).getDay();
      const daysInMonth = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(currentViewYear, currentViewMonth, 0).getDate();

      const todayStr = this.formatDateIso(now);
      const selectedStr = input.value || '';

      // 1. Previous Month Days
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'datepicker-day other-month';
        cell.textContent = d;
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          currentViewMonth--;
          if (currentViewMonth < 0) {
            currentViewMonth = 11;
            currentViewYear--;
          }
          const prevDate = new Date(currentViewYear, currentViewMonth, d);
          this.selectDate(input, textSpan, wrapper, this.formatDateIso(prevDate));
          renderCalendar();
        });
        daysGrid.appendChild(cell);
      }

      // 2. Current Month Days
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'datepicker-day';
        cell.textContent = d;

        const cellDate = new Date(currentViewYear, currentViewMonth, d);
        const cellIso = this.formatDateIso(cellDate);

        if (cellIso === todayStr) {
          cell.classList.add('today');
        }
        if (cellIso === selectedStr) {
          cell.classList.add('selected');
        }

        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectDate(input, textSpan, wrapper, cellIso);
        });

        daysGrid.appendChild(cell);
      }

      // 3. Next Month Days (fill remaining grid slots to 42 cells or full weeks)
      const totalRendered = firstDayOfMonth + daysInMonth;
      const nextMonthSlots = (totalRendered % 7 === 0) ? 0 : 7 - (totalRendered % 7);
      for (let d = 1; d <= nextMonthSlots; d++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'datepicker-day other-month';
        cell.textContent = d;
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          currentViewMonth++;
          if (currentViewMonth > 11) {
            currentViewMonth = 0;
            currentViewYear++;
          }
          const nextDate = new Date(currentViewYear, currentViewMonth, d);
          this.selectDate(input, textSpan, wrapper, this.formatDateIso(nextDate));
          renderCalendar();
        });
        daysGrid.appendChild(cell);
      }

      popup.appendChild(daysGrid);

      // Footer: Clear & Today actions
      const footer = document.createElement('div');
      footer.className = 'datepicker-footer';

      const btnClear = document.createElement('button');
      btnClear.type = 'button';
      btnClear.className = 'btn-datepicker-footer btn-clear';
      btnClear.textContent = 'Hapus';
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDate(input, textSpan, wrapper, '');
      });

      const btnToday = document.createElement('button');
      btnToday.type = 'button';
      btnToday.className = 'btn-datepicker-footer btn-today';
      btnToday.textContent = 'Hari Ini';
      btnToday.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDate(input, textSpan, wrapper, todayStr);
      });

      footer.appendChild(btnClear);
      footer.appendChild(btnToday);
      popup.appendChild(footer);
    };

    renderCalendar();

    wrapper.appendChild(trigger);
    wrapper.appendChild(popup);
    input.parentNode.insertBefore(wrapper, input.nextSibling);

    // Toggle on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAlreadyOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.custom-select-container.open, .custom-datepicker-container.open, .user-profile-dropdown.open').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      if (!isAlreadyOpen) {
        // Sync calendar view with current input value
        if (input.value) {
          const parts = input.value.split('-');
          if (parts.length === 3) {
            currentViewYear = parseInt(parts[0], 10);
            currentViewMonth = parseInt(parts[1], 10) - 1;
          }
        }
        renderCalendar();
      }
      wrapper.classList.toggle('open', !isAlreadyOpen);
    });

    // Native input value change sync
    input.addEventListener('change', () => {
      textSpan.textContent = this.formatDateDisplay(input.value);
    });
  },

  selectDate(input, textSpan, wrapper, isoDate) {
    input.value = isoDate;
    textSpan.textContent = this.formatDateDisplay(isoDate);
    if (wrapper) wrapper.classList.remove('open');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  },

  formatDateDisplay(isoDate) {
    if (!isoDate) return 'dd/mm/yyyy';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  },

  formatDateIso(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-datepicker-container')) {
        document.querySelectorAll('.custom-datepicker-container.open').forEach(w => w.classList.remove('open'));
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-datepicker-container.open').forEach(w => w.classList.remove('open'));
      }
    });
  }
};
