/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Custom Autocomplete Component
 * Replaces native unstyled datalist popups with sleek corporate theme dropdowns
 */

const CustomAutocomplete = {
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
      // Remove list attribute so browser default ugly black box doesn't pop up
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

      const cleanQuery = filterText.toLowerCase().trim();
      const filtered = allOptions.filter(opt => opt.toLowerCase().includes(cleanQuery));

      if (filtered.length === 0) {
        wrapper.classList.remove('open');
        return;
      }

      filtered.forEach((optText, idx) => {
        const item = document.createElement('div');
        item.className = 'custom-autocomplete-item';
        item.textContent = optText;

        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = optText;
          wrapper.classList.remove('open');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menu.appendChild(item);
      });

      wrapper.classList.add('open');
    };

    // Events
    input.addEventListener('focus', () => {
      renderMenu(input.value);
    });

    input.addEventListener('input', () => {
      renderMenu(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = menu.querySelectorAll('.custom-autocomplete-item');
      if (!items.length || !wrapper.classList.contains('open')) return;

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
          input.value = items[activeIndex].textContent;
          wrapper.classList.remove('open');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (e.key === 'Escape') {
        wrapper.classList.remove('open');
      }
    });

    input.addEventListener('blur', () => {
      // Delay closing so mousedown on item can trigger
      setTimeout(() => {
        wrapper.classList.remove('open');
      }, 180);
    });
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
        itemAll.innerHTML = `<span>Semua Pemasok</span>`;
        
        itemAll.addEventListener('mousedown', (e) => {
          e.preventDefault();
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
          item.innerHTML = `<span>${highlightMatch(s, forceAll ? '' : cleanQuery)}</span>`;
          
          item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectSupplier(s);
          });
          menu.appendChild(item);
        });
      }

      container.classList.add('open');
    };

    const selectSupplier = (supplier) => {
      selectedValue = supplier ? supplier.trim() : '';
      input.value = selectedValue;
      container.classList.remove('open');
      onSelect(selectedValue);
    };

    const openDropdown = (forceAll = true) => {
      document.querySelectorAll('.custom-combobox.open, .custom-autocomplete-container.open').forEach(c => {
        if (c !== container) c.classList.remove('open');
      });
      renderMenu(input.value, forceAll);
    };

    const closeDropdown = () => {
      container.classList.remove('open');
    };

    // Events
    input.addEventListener('focus', () => {
      openDropdown(false);
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      renderMenu(val, false);
      selectedValue = val.trim();
      onInput(selectedValue);
    });

    input.addEventListener('change', () => {
      const val = input.value.trim();
      if (!val || val.toLowerCase() === 'semua pemasok') {
        selectSupplier('');
      } else {
        selectedValue = val;
        onSelect(selectedValue);
      }
    });

    if (chevronBtn) {
      chevronBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (container.classList.contains('open')) {
          closeDropdown();
        } else {
          openDropdown(true);
          input.focus();
        }
      });
    }

    input.addEventListener('keydown', (e) => {
      const items = menu.querySelectorAll('.custom-combobox-item');
      if (!items.length || !container.classList.contains('open')) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
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
          items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
        } else if (items.length > 0) {
          items[0].dispatchEvent(new MouseEvent('mousedown'));
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        closeDropdown();
      }, 200);
    });

    return {
      setValue: (val) => {
        selectedValue = val ? val.trim() : '';
        input.value = selectedValue;
      },
      getValue: () => selectedValue,
      open: () => openDropdown(true),
      close: () => closeDropdown(),
      refresh: () => {
        if (container.classList.contains('open')) {
          renderMenu(input.value, false);
        }
      }
    };
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

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-autocomplete-container') && !e.target.closest('.custom-combobox')) {
        document.querySelectorAll('.custom-autocomplete-container.open, .custom-combobox.open').forEach(w => w.classList.remove('open'));
      }
    });
  }
};
