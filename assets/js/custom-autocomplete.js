/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Custom Autocomplete & Combobox Component
 * Provides searchable dropdowns and corporate-themed selection widgets
 */

const CustomAutocomplete = {
  activeInstances: new Set(),
  _globalEventsBound: false,

  registerInstance(inst) {
    if (!this.activeInstances) this.activeInstances = new Set();
    this.activeInstances.add(inst);
  },

  unregisterInstance(inst) {
    if (this.activeInstances) {
      this.activeInstances.delete(inst);
    }
  },

  init() {
    this.enhanceAll();
    this.bindGlobalEvents();
  },

  enhanceAll() {
    document.querySelectorAll('input[list]').forEach(input => {
      this.enhance(input);
    });
  },

  enhance(input) {
    if (!input || input.dataset.customAutoEnhanced === 'true') return;
    input.dataset.customAutoEnhanced = 'true';

    const listId = input.getAttribute('list');
    const datalist = document.getElementById(listId);
    let options = [];

    if (datalist) {
      options = Array.from(datalist.querySelectorAll('option')).map(opt => opt.value || opt.textContent).filter(Boolean);
      // Remove list attribute so browser default datalist doesn't pop up
      input.removeAttribute('list');
    }

    // Default supplier list fallback if empty
    if (options.length === 0 && input.id === 'input-supplier') {
      options = [
        'Andi',
        'Baihaqi',
        'Eva Pratama (H. Gafur)',
        'Eva Pratama (Hj. Gafur)',
        'H. Dulwafi',
        'H. Junaidi',
        'H. Tomi',
        'Hj. Abbas',
        'Hj. Faruq',
        'Hj. Junaidi',
        'Hosnan',
        'Inung',
        'Koperasi RGM',
        'Lutfiadi',
        'Moh Jufri',
        "Moh. Syafi'i",
        'Nasiruddin',
        'Noval',
        'Pak Sawawi',
        'PT. Tambak Garam Madura',
        'Rangga Mahardika',
        'Ribut (Moh Saleh)',
        'Sadili',
        'Samsul',
        'Samsul Intan Jaya',
        'Sawawi',
        'Serikat Nelayan (NU)',
        'Sukamto',
        'Supriadi',
        'Surahman',
        'UD. Garam Sejahtera Madura'
      ];
    }

    // Wrap input
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-autocomplete-container';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Floating Menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu-card custom-autocomplete-menu';
    wrapper.appendChild(menu);

    let activeIndex = -1;
    let isOpen = false;
    let isSelecting = false;

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    menu.setAttribute('role', 'listbox');

    const adjustPlacement = () => {
      const inputRect = input.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const availableBelow = Math.max(0, spaceBelow - 14);
      const availableAbove = Math.max(0, spaceAbove - 14);

      const itemCount = menu.children.length;
      const naturalHeight = Math.min(260, (itemCount * 36) + 16);

      const shouldFlip = (availableBelow < naturalHeight && availableAbove > availableBelow) || (availableBelow < 130 && availableAbove >= 100);

      if (shouldFlip) {
        wrapper.classList.add('open-upward');
        menu.style.top = 'auto';
        menu.style.bottom = 'calc(100% + 4px)';
        const maxAllowed = Math.max(90, Math.min(260, availableAbove));
        menu.style.maxHeight = `${maxAllowed}px`;
      } else {
        wrapper.classList.remove('open-upward');
        menu.style.top = 'calc(100% + 4px)';
        menu.style.bottom = 'auto';
        const maxAllowed = Math.max(90, Math.min(260, availableBelow));
        menu.style.maxHeight = `${maxAllowed}px`;
      }
      menu.style.overflowY = 'auto';
    };

    const closeDropdown = () => {
      isOpen = false;
      wrapper.classList.remove('open', 'open-upward');
      menu.style.maxHeight = '';
      menu.style.top = '';
      menu.style.bottom = '';
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      menu.querySelectorAll('.custom-autocomplete-item.active').forEach(el => el.classList.remove('active'));
      if (typeof CustomSelectManager !== 'undefined' && CustomSelectManager.elevateAncestors) {
        CustomSelectManager.elevateAncestors(wrapper, false);
      }
    };

    const selectOption = (optText) => {
      isSelecting = true;
      input.value = optText;
      closeDropdown();

      // Dispatch change & input events safely
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // Strictly ensure menu stays closed after event dispatch
      closeDropdown();
      setTimeout(() => {
        isSelecting = false;
      }, 60);
    };

    const renderMenu = (filterText = '') => {
      menu.innerHTML = '';
      activeIndex = -1;

      // Merge options and dynamic suppliers from storage, deduplicate, and sort strictly A - Z
      const optionSet = new Set(options.map(opt => typeof opt === 'string' ? opt.trim() : opt).filter(Boolean));
      if (typeof StorageManager !== 'undefined' && StorageManager.getTransactions) {
        const txs = StorageManager.getTransactions();
        txs.forEach(t => {
          if (t.supplier && t.supplier.trim()) {
            optionSet.add(t.supplier.trim());
          }
        });
      }

      const allOptions = Array.from(optionSet).sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
      const cleanQuery = (filterText || '').toLowerCase().trim();
      const filtered = allOptions.filter(opt => opt.toLowerCase().includes(cleanQuery));

      if (filtered.length === 0) {
        closeDropdown();
        return;
      }

      // Close all other dropdowns
      document.querySelectorAll('.custom-combobox.open, .custom-autocomplete-container.open, .custom-select-container.open, .user-profile-dropdown.open').forEach(c => {
        if (c !== wrapper) {
          c.classList.remove('open', 'open-upward');
          const inp = c.querySelector('input');
          if (inp) inp.setAttribute('aria-expanded', 'false');
        }
      });

      filtered.forEach((optText) => {
        const item = document.createElement('div');
        item.className = 'custom-autocomplete-item';
        item.setAttribute('role', 'option');
        item.textContent = optText;

        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectOption(optText);
        });

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectOption(optText);
        });

        menu.appendChild(item);
      });

      adjustPlacement();
      isOpen = true;
      wrapper.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      if (typeof CustomSelectManager !== 'undefined' && CustomSelectManager.elevateAncestors) {
        CustomSelectManager.elevateAncestors(wrapper, true);
      }
    };

    // Events
    input.addEventListener('focus', () => {
      if (!isSelecting) {
        renderMenu(input.value);
      }
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isOpen && !isSelecting) {
        renderMenu(input.value);
      }
    });

    input.addEventListener('input', () => {
      if (!isSelecting) {
        renderMenu(input.value);
      }
    });

    input.addEventListener('keydown', (e) => {
      const items = menu.querySelectorAll('.custom-autocomplete-item');
      if (!items.length || !isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          renderMenu(input.value);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        this.updateActiveItem(items, activeIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        this.updateActiveItem(items, activeIndex);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          selectOption(items[activeIndex].textContent);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      } else if (e.key === 'Tab') {
        closeDropdown();
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) {
          closeDropdown();
        }
      }, 150);
    });

    const instance = {
      close: () => closeDropdown(),
      adjust: () => { if (isOpen) adjustPlacement(); },
      getContainer: () => wrapper,
      getInput: () => input,
      isOpen: () => isOpen
    };
    this.registerInstance(instance);
  },

  createSupplierCombobox(config = {}) {
    const {
      containerId,
      inputId,
      chevronBtnId,
      menuId,
      placeholder = 'Semua Pemasok',
      initialValue = '',
      onSelect = () => {},
      onInput = () => {}
    } = config;

    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const chevronBtn = document.getElementById(chevronBtnId);
    const menu = document.getElementById(menuId);

    if (!container || !input || !menu) return null;

    let selectedValue = initialValue || '';
    let activeIndex = -1;
    let isOpen = false;
    let isSelecting = false;

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    menu.setAttribute('role', 'listbox');

    const getSuppliers = () => {
      const defaultPresets = [
        'Andi', 'Baihaqi', 'Eva Pratama (H. Gafur)', 'Eva Pratama (Hj. Gafur)',
        'H. Dulwafi', 'H. Junaidi', 'H. Tomi', 'Hj. Abbas', 'Hj. Faruq',
        'Hj. Junaidi', 'Hosnan', 'Inung', 'Koperasi RGM', 'Lutfiadi',
        'Moh Jufri', "Moh. Syafi'i", 'Nasiruddin', 'Noval', 'Pak Sawawi',
        'PT. Tambak Garam Madura', 'Rangga Mahardika', 'Ribut (Moh Saleh)',
        'Sadili', 'Samsul', 'Samsul Intan Jaya', 'Sawawi',
        'Serikat Nelayan (NU)', 'Sukamto', 'Supriadi', 'Surahman',
        'UD. Garam Sejahtera Madura'
      ];
      const supplierSet = new Set();
      if (typeof StorageManager !== 'undefined' && StorageManager.getTransactions) {
        StorageManager.getTransactions().forEach(t => {
          if (t.supplier && t.supplier.trim()) supplierSet.add(t.supplier.trim());
        });
      }
      defaultPresets.forEach(p => supplierSet.add(p.trim()));
      return Array.from(supplierSet).sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
    };

    const highlightMatch = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<span class="highlight-match">$1</span>');
    };

    const adjustPlacement = () => {
      const inputRect = input.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const availableBelow = Math.max(0, spaceBelow - 14);
      const availableAbove = Math.max(0, spaceAbove - 14);

      const itemCount = menu.children.length;
      const naturalHeight = Math.min(260, (itemCount * 36) + 16);

      const shouldFlip = (availableBelow < naturalHeight && availableAbove > availableBelow) || (availableBelow < 130 && availableAbove >= 100);

      if (shouldFlip) {
        container.classList.add('open-upward');
        menu.style.top = 'auto';
        menu.style.bottom = 'calc(100% + 4px)';
        const maxAllowed = Math.max(90, Math.min(260, availableAbove));
        menu.style.maxHeight = `${maxAllowed}px`;
      } else {
        container.classList.remove('open-upward');
        menu.style.top = 'calc(100% + 4px)';
        menu.style.bottom = 'auto';
        const maxAllowed = Math.max(90, Math.min(260, availableBelow));
        menu.style.maxHeight = `${maxAllowed}px`;
      }
      menu.style.overflowY = 'auto';
    };

    const closeDropdown = () => {
      isOpen = false;
      container.classList.remove('open', 'open-upward');
      menu.style.maxHeight = '';
      menu.style.top = '';
      menu.style.bottom = '';
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      menu.querySelectorAll('.custom-combobox-item.active').forEach(el => el.classList.remove('active'));
      if (typeof CustomSelectManager !== 'undefined' && CustomSelectManager.elevateAncestors) {
        CustomSelectManager.elevateAncestors(container, false);
      }
    };

    const selectSupplier = (supplier) => {
      isSelecting = true;
      selectedValue = supplier ? supplier.trim() : '';
      input.value = selectedValue;

      // 1. Immediately close the dropdown
      closeDropdown();

      // 2. Invoke callback
      try {
        onSelect(selectedValue);
      } catch (err) {
        console.error('onSelect callback error:', err);
      }

      // 3. Keep selecting flag briefly to suppress subsequent input/blur cascades
      setTimeout(() => {
        isSelecting = false;
      }, 60);
    };

    const openDropdown = (forceAll = false) => {
      // Close all other dropdowns
      document.querySelectorAll('.custom-combobox.open, .custom-autocomplete-container.open, .custom-select-container.open, .user-profile-dropdown.open').forEach(c => {
        if (c !== container) {
          c.classList.remove('open', 'open-upward');
          const inp = c.querySelector('input');
          if (inp) inp.setAttribute('aria-expanded', 'false');
          if (typeof CustomSelectManager !== 'undefined' && CustomSelectManager.elevateAncestors) {
            CustomSelectManager.elevateAncestors(c, false);
          }
        }
      });

      renderMenu(input.value, forceAll);
    };

    const renderMenu = (query = '', forceAll = false) => {
      menu.innerHTML = '';
      activeIndex = -1;
      const suppliers = getSuppliers();
      const cleanQuery = (query || '').toLowerCase().trim();

      // Item 1: Semua Pemasok
      const isSemuaMatch = forceAll || !cleanQuery || 'semua pemasok'.includes(cleanQuery);
      if (isSemuaMatch) {
        const itemAll = document.createElement('div');
        itemAll.className = `custom-combobox-item special-all ${!selectedValue ? 'selected' : ''}`;
        itemAll.setAttribute('role', 'option');
        itemAll.setAttribute('aria-selected', !selectedValue ? 'true' : 'false');
        itemAll.innerHTML = `<span>Semua Pemasok</span>`;

        itemAll.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectSupplier('');
        });

        itemAll.addEventListener('click', (e) => {
          e.stopPropagation();
          selectSupplier('');
        });

        menu.appendChild(itemAll);
      }

      // Filtered suppliers
      const filtered = forceAll
        ? suppliers
        : suppliers.filter(s => !cleanQuery || s.toLowerCase().includes(cleanQuery));

      if (filtered.length === 0 && !isSemuaMatch) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'custom-combobox-empty';
        emptyDiv.textContent = `Tidak ditemukan pemasok "${query}"`;
        menu.appendChild(emptyDiv);
      } else {
        filtered.forEach(s => {
          const isSel = selectedValue && selectedValue.toLowerCase() === s.toLowerCase();
          const item = document.createElement('div');
          item.className = `custom-combobox-item ${isSel ? 'selected' : ''}`;
          item.setAttribute('role', 'option');
          item.setAttribute('aria-selected', isSel ? 'true' : 'false');
          item.innerHTML = `<span>${highlightMatch(s, forceAll ? '' : cleanQuery)}</span>`;

          item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectSupplier(s);
          });

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectSupplier(s);
          });

          menu.appendChild(item);
        });
      }

      adjustPlacement();
      isOpen = true;
      container.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      if (typeof CustomSelectManager !== 'undefined' && CustomSelectManager.elevateAncestors) {
        CustomSelectManager.elevateAncestors(container, true);
      }
    };

    // Events
    input.addEventListener('focus', () => {
      if (!isSelecting) {
        openDropdown(false);
      }
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isOpen && !isSelecting) {
        openDropdown(false);
      }
    });

    input.addEventListener('input', (e) => {
      if (isSelecting) return;
      const val = e.target.value;
      selectedValue = val.trim();
      openDropdown(false);
      try {
        onInput(selectedValue);
      } catch (err) {
        console.error('onInput error:', err);
      }
    });

    input.addEventListener('change', () => {
      if (isSelecting) return;
      const val = input.value.trim();
      if (!val || val.toLowerCase() === 'semua pemasok') {
        selectSupplier('');
      } else {
        selectedValue = val;
        closeDropdown();
        try {
          onSelect(selectedValue);
        } catch (err) {
          console.error('onSelect error:', err);
        }
      }
    });

    if (chevronBtn) {
      chevronBtn.addEventListener('mousedown', (e) => {
        // Prevent chevron click from stealing input focus and firing unexpected blur events
        e.preventDefault();
      });

      chevronBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen) {
          closeDropdown();
        } else {
          openDropdown(true);
          input.focus();
        }
      });
    }

    input.addEventListener('keydown', (e) => {
      const items = menu.querySelectorAll('.custom-combobox-item');
      if (!items.length || !isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openDropdown(true);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        this.updateActiveItem(items, activeIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        this.updateActiveItem(items, activeIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].dispatchEvent(new MouseEvent('click'));
        } else if (items.length > 0) {
          items[0].dispatchEvent(new MouseEvent('click'));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      } else if (e.key === 'Tab') {
        closeDropdown();
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!container.contains(document.activeElement)) {
          closeDropdown();
        }
      }, 150);
    });

    const instance = {
      setValue: (val) => {
        selectedValue = val ? val.trim() : '';
        input.value = selectedValue;
        closeDropdown();
      },
      getValue: () => selectedValue,
      open: () => openDropdown(true),
      close: () => closeDropdown(),
      adjust: () => { if (isOpen) adjustPlacement(); },
      refresh: () => {
        // Strictly only refresh if open AND input is actively focused
        if (isOpen && document.activeElement === input) {
          renderMenu(input.value, false);
        }
      },
      getContainer: () => container,
      getInput: () => input,
      isOpen: () => isOpen
    };

    this.registerInstance(instance);
    return instance;
  },

  updateActiveItem(items, index) {
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  },

  closeAll() {
    document.querySelectorAll('.custom-autocomplete-container.open, .custom-combobox.open').forEach(w => {
      w.classList.remove('open', 'open-upward');
      const inp = w.querySelector('input');
      if (inp) inp.setAttribute('aria-expanded', 'false');
    });

    if (this.activeInstances) {
      this.activeInstances.forEach(inst => {
        if (inst && typeof inst.close === 'function') {
          inst.close();
        }
      });
    }
  },

  bindGlobalEvents() {
    if (this._globalEventsBound) return;
    this._globalEventsBound = true;

    // 1. Outside pointer interaction detection using capture phase
    // Capture phase ensures stopPropagation() from child elements cannot swallow outside detection
    const handleOutsideInteraction = (e) => {
      const activeContainer = e.target.closest('.custom-autocomplete-container, .custom-combobox');

      document.querySelectorAll('.custom-autocomplete-container.open, .custom-combobox.open').forEach(w => {
        if (w !== activeContainer) {
          w.classList.remove('open', 'open-upward');
          const inp = w.querySelector('input');
          if (inp) inp.setAttribute('aria-expanded', 'false');
        }
      });

      if (this.activeInstances) {
        this.activeInstances.forEach(inst => {
          if (inst && inst.getContainer) {
            const c = inst.getContainer();
            if (c !== activeContainer && typeof inst.close === 'function') {
              inst.close();
            }
          }
        });
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction, true);
    document.addEventListener('click', handleOutsideInteraction, true);

    // 2. Focus change detection: when user switches focus to another input or button (e.g. #supplier-history-search)
    document.addEventListener('focusin', (e) => {
      const activeContainer = e.target.closest('.custom-autocomplete-container, .custom-combobox');

      document.querySelectorAll('.custom-autocomplete-container.open, .custom-combobox.open').forEach(w => {
        if (w !== activeContainer) {
          w.classList.remove('open', 'open-upward');
          const inp = w.querySelector('input');
          if (inp) inp.setAttribute('aria-expanded', 'false');
        }
      });

      if (this.activeInstances) {
        this.activeInstances.forEach(inst => {
          if (inst && inst.getContainer) {
            const c = inst.getContainer();
            if (c !== activeContainer && typeof inst.close === 'function') {
              inst.close();
            }
          }
        });
      }
    }, true);

    // 3. Escape key listener to dismiss all dropdown menus
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });

    // 4. Window blur listener
    window.addEventListener('blur', () => {
      this.closeAll();
    });

    // 5. Dynamic capture scroll and resize listener
    const handleScrollOrResize = (e) => {
      if (this.activeInstances) {
        this.activeInstances.forEach(inst => {
          if (inst && typeof inst.isOpen === 'function' && inst.isOpen() && typeof inst.adjust === 'function') {
            const container = inst.getContainer ? inst.getContainer() : null;
            if (e && e.target && container && container.contains(e.target) && (e.target.classList.contains('custom-autocomplete-menu') || e.target.classList.contains('custom-combobox-menu'))) {
              return;
            }
            inst.adjust();
          }
        });
      }
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
  }
};
