/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Custom Timepicker Component
 * Replaces native browser time inputs with sleek, corporate theme timepicker popups
 */

const CustomTimePicker = {
  init() {
    this.enhanceAll();
    this.bindGlobalEvents();
  },

  enhanceAll() {
    document.querySelectorAll('input[type="time"]').forEach(input => {
      this.enhance(input);
    });
  },

  enhance(input) {
    if (!input || input.dataset.customTimeEnhanced === 'true') return;
    input.dataset.customTimeEnhanced = 'true';
    input.style.display = 'none';

    // Container
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-timepicker-container';
    if (input.style.width) wrapper.style.width = input.style.width;
    if (input.style.minWidth) wrapper.style.minWidth = input.style.minWidth;
    if (input.style.maxWidth) wrapper.style.maxWidth = input.style.maxWidth;
    if (input.style.flex) wrapper.style.flex = input.style.flex;
    wrapper.id = `timepicker-wrapper-${input.id || Math.random().toString(36).substr(2, 9)}`;

    // Custom Trigger Button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-timepicker-trigger';
    if (input.classList.contains('form-control-sm')) {
      trigger.classList.add('custom-timepicker-sm');
    }

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-timepicker-text mono-num';
    textSpan.textContent = input.value || '--:--';
    trigger.appendChild(textSpan);

    // Clock Icon (SVG stroke-width 2, zero emojis)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'custom-timepicker-icon';
    iconSpan.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
    trigger.appendChild(iconSpan);

    // Floating Popup
    const popup = document.createElement('div');
    popup.className = 'dropdown-menu-card custom-timepicker-popup';

    // State
    let selectedHour = input.value ? input.value.split(':')[0] : '';
    let selectedMinute = input.value ? input.value.split(':')[1] : '';

    const renderPopup = () => {
      popup.innerHTML = '';

      // Header
      const header = document.createElement('div');
      header.className = 'timepicker-header';

      const title = document.createElement('div');
      title.className = 'timepicker-title';
      title.textContent = 'Pilih Waktu (WIB)';

      const preview = document.createElement('div');
      preview.className = 'timepicker-preview mono-num';
      preview.textContent = (selectedHour && selectedMinute) ? `${selectedHour}:${selectedMinute}` : '--:--';

      header.appendChild(title);
      header.appendChild(preview);
      popup.appendChild(header);

      // Columns Grid Container
      const columnsContainer = document.createElement('div');
      columnsContainer.className = 'timepicker-columns';

      // Column 1: Hours (00-23)
      const hourCol = document.createElement('div');
      hourCol.className = 'timepicker-col';

      const hourColTitle = document.createElement('div');
      hourColTitle.className = 'timepicker-col-title';
      hourColTitle.textContent = 'Jam';
      hourCol.appendChild(hourColTitle);

      const hourList = document.createElement('div');
      hourList.className = 'timepicker-list';

      for (let h = 0; h < 24; h++) {
        const hStr = h.toString().padStart(2, '0');
        const item = document.createElement('div');
        item.className = `timepicker-item mono-num ${selectedHour === hStr ? 'selected' : ''}`;
        item.textContent = hStr;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedHour = hStr;
          if (!selectedMinute) selectedMinute = '00';
          updateTime();
          renderPopup();
        });

        hourList.appendChild(item);
      }
      hourCol.appendChild(hourList);
      columnsContainer.appendChild(hourCol);

      // Column 2: Minutes (00-59)
      const minCol = document.createElement('div');
      minCol.className = 'timepicker-col';

      const minColTitle = document.createElement('div');
      minColTitle.className = 'timepicker-col-title';
      minColTitle.textContent = 'Menit';
      minCol.appendChild(minColTitle);

      const minList = document.createElement('div');
      minList.className = 'timepicker-list';

      for (let m = 0; m < 60; m++) {
        const mStr = m.toString().padStart(2, '0');
        const item = document.createElement('div');
        item.className = `timepicker-item mono-num ${selectedMinute === mStr ? 'selected' : ''}`;
        item.textContent = mStr;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedMinute = mStr;
          if (!selectedHour) {
            const nowH = new Date().getHours().toString().padStart(2, '0');
            selectedHour = nowH;
          }
          updateTime();
          renderPopup();
        });

        minList.appendChild(item);
      }
      minCol.appendChild(minList);
      columnsContainer.appendChild(minCol);

      popup.appendChild(columnsContainer);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'timepicker-footer';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'btn-timepicker-footer btn-clear';
      clearBtn.textContent = 'Hapus';
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedHour = '';
        selectedMinute = '';
        input.value = '';
        textSpan.textContent = '--:--';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        wrapper.classList.remove('open');
      });

      const nowBtn = document.createElement('button');
      nowBtn.type = 'button';
      nowBtn.className = 'btn-timepicker-footer btn-now';
      nowBtn.textContent = 'Sekarang';
      nowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const d = new Date();
        selectedHour = d.getHours().toString().padStart(2, '0');
        selectedMinute = d.getMinutes().toString().padStart(2, '0');
        updateTime();
        wrapper.classList.remove('open');
      });

      footer.appendChild(clearBtn);
      footer.appendChild(nowBtn);
      popup.appendChild(footer);

      // Scroll active items into view
      setTimeout(() => {
        const selHourEl = hourList.querySelector('.timepicker-item.selected');
        if (selHourEl) selHourEl.scrollIntoView({ block: 'center' });
        const selMinEl = minList.querySelector('.timepicker-item.selected');
        if (selMinEl) selMinEl.scrollIntoView({ block: 'center' });
      }, 10);
    };

    const updateTime = () => {
      if (selectedHour && selectedMinute) {
        const val = `${selectedHour}:${selectedMinute}`;
        input.value = val;
        textSpan.textContent = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    // Trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.custom-timepicker-container.open, .custom-datepicker-container.open, .custom-select-container.open').forEach(el => {
        if (el !== wrapper) el.classList.remove('open');
      });

      if (!isOpen) {
        if (input.value) {
          const parts = input.value.split(':');
          if (parts.length >= 2) {
            selectedHour = parts[0];
            selectedMinute = parts[1];
          }
        }
        renderPopup();
        wrapper.classList.add('open');
      } else {
        wrapper.classList.remove('open');
      }
    });

    // Native value observer
    const observer = new MutationObserver(() => {
      textSpan.textContent = input.value || '--:--';
    });
    observer.observe(input, { attributes: true, attributeFilter: ['value'] });

    // Native property setter hook
    const originalValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (originalValueSetter) {
      Object.defineProperty(input, 'value', {
        set: function(val) {
          originalValueSetter.call(this, val);
          textSpan.textContent = val || '--:--';
        },
        get: function() {
          return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.get.call(this);
        },
        configurable: true
      });
    }

    // Assembly
    wrapper.appendChild(trigger);
    wrapper.appendChild(popup);
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-timepicker-container')) {
        document.querySelectorAll('.custom-timepicker-container.open').forEach(w => w.classList.remove('open'));
      }
    });
  }
};
