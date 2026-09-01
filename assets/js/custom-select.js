/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Custom Select Dropdown Component
 * Converts native HTML selects into beautiful, fully styled floating dropdowns
 */

const FA_ICONS = {
  arrowRight: '<svg class="inline-arrow-icon" width="11" height="11" viewBox="0 0 448 512" fill="currentColor" style="display:inline-block; vertical-align:-1px; margin:0 5px; opacity:0.85;"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>',
  arrowDown: '<svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; margin-left: 6px;"><polyline points="6 9 12 15 18 9"></polyline></svg>'
};

function formatOptionLabel(text) {
  if (!text) return '';
  return text.replace(/→|&rarr;|->/g, FA_ICONS.arrowRight);
}

const CustomSelectManager = {
  init() {
    this.enhanceAll();
    this.bindGlobalEvents();
  },

  enhanceAll() {
    document.querySelectorAll('select.form-select').forEach(select => {
      this.enhance(select);
    });
  },

  enhance(select) {
    if (!select) return;
    if (select.dataset.customEnhanced === 'true') {
      this.sync(select);
      return;
    }
    select.dataset.customEnhanced = 'true';
    select.style.display = 'none';

    // Create container
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-container';
    if (select.classList.contains('form-select-sm')) {
      wrapper.classList.add('custom-select-sm');
    }
    if (select.style.width) {
      wrapper.style.width = select.style.width;
    }
    if (select.style.minWidth) {
      wrapper.style.minWidth = select.style.minWidth;
    }
    if (select.style.maxWidth) {
      wrapper.style.maxWidth = select.style.maxWidth;
    }
    if (select.style.flex) {
      wrapper.style.flex = select.style.flex;
    }
    wrapper.id = `custom-wrapper-${select.id || Math.random().toString(36).substr(2, 9)}`;

    // Create trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    const selectedOption = select.options[select.selectedIndex] || select.options[0];
    
    const textSpan = document.createElement('span');
    textSpan.className = 'custom-select-text';
    textSpan.innerHTML = formatOptionLabel(selectedOption ? selectedOption.text : 'Pilih...');
    trigger.appendChild(textSpan);

    const chevronWrapper = document.createElement('span');
    chevronWrapper.innerHTML = FA_ICONS.arrowDown;
    trigger.appendChild(chevronWrapper.firstElementChild);

    // Create floating dropdown menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu-card custom-select-menu';

    this.populateMenu(select, menu, trigger, textSpan);

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    select.parentNode.insertBefore(wrapper, select.nextSibling);

    // Toggle on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAlreadyOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.custom-select-container.open, .user-profile-dropdown.open').forEach(w => {
        if (w !== wrapper) {
          w.classList.remove('open');
          const parentBlock = w.closest('.section-block, .form-row, .card');
          if (parentBlock) parentBlock.style.zIndex = '';
        }
      });

      const parentBlock = wrapper.closest('.section-block, .form-row, .card');
      if (!isAlreadyOpen) {
        wrapper.classList.add('open');
        if (parentBlock) parentBlock.style.zIndex = '500';

        // Smart screen & container boundary positioning (prevent right edge overflow/clipping)
        menu.style.left = '0';
        menu.style.right = 'auto';
        
        requestAnimationFrame(() => {
          const menuRect = menu.getBoundingClientRect();
          const boundaryParent = wrapper.closest('.perm-main-panel, .modal-body, .modal-container, .card, .table-toolbar, .section-block') || document.body;
          const boundaryRect = boundaryParent.getBoundingClientRect();

          if (menuRect.right > window.innerWidth - 12 || (boundaryParent !== document.body && menuRect.right > boundaryRect.right - 12)) {
            menu.style.left = 'auto';
            menu.style.right = '0';
          }
        });
      } else {
        wrapper.classList.remove('open');
        if (parentBlock) parentBlock.style.zIndex = '';
      }
    });

    // Listen to native select change events
    select.addEventListener('change', () => {
      const curr = select.options[select.selectedIndex];
      if (curr) {
        textSpan.innerHTML = formatOptionLabel(curr.text);
        menu.querySelectorAll('.custom-select-option').forEach(opt => {
          if (opt.dataset.value === curr.value) {
            opt.classList.add('selected');
          } else {
            opt.classList.remove('selected');
          }
        });
      }
    });
  },

  populateMenu(select, menu, trigger, textSpan) {
    menu.innerHTML = '';
    Array.from(select.options).forEach(option => {
      const optItem = document.createElement('div');
      optItem.className = `dropdown-menu-item custom-select-option ${option.selected ? 'selected' : ''}`;
      optItem.dataset.value = option.value;
      optItem.innerHTML = formatOptionLabel(option.text);

      optItem.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = option.value;
        textSpan.innerHTML = formatOptionLabel(option.text);
        menu.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        optItem.classList.add('selected');
        const wrapper = trigger.closest('.custom-select-container');
        if (wrapper) {
          wrapper.classList.remove('open', 'open-upward');
          const parentBlock = wrapper.closest('.section-block, .form-row, .card');
          if (parentBlock) parentBlock.style.zIndex = '';
        }

        // Dispatch change event to original select
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      menu.appendChild(optItem);
    });
  },

  sync(select) {
    if (!select) return;
    const wrapper = select.nextElementSibling;
    if (wrapper && wrapper.classList.contains('custom-select-container')) {
      const trigger = wrapper.querySelector('.custom-select-trigger');
      const textSpan = wrapper.querySelector('.custom-select-text');
      const menu = wrapper.querySelector('.custom-select-menu');
      const selectedOption = select.options[select.selectedIndex] || select.options[0];
      if (textSpan && selectedOption) {
        textSpan.innerHTML = formatOptionLabel(selectedOption.text);
      }
      if (menu && trigger && textSpan) {
        this.populateMenu(select, menu, trigger, textSpan);
      }
    }
  },

  syncAll() {
    document.querySelectorAll('select.form-select').forEach(select => {
      this.sync(select);
    });
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-container')) {
        document.querySelectorAll('.custom-select-container.open').forEach(w => {
          w.classList.remove('open');
          const parentBlock = w.closest('.section-block, .form-row, .card');
          if (parentBlock) parentBlock.style.zIndex = '';
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select-container.open, .user-profile-dropdown.open').forEach(w => {
          w.classList.remove('open');
          const parentBlock = w.closest('.section-block, .form-row, .card');
          if (parentBlock) parentBlock.style.zIndex = '';
        });
      }
    });
  }
};
