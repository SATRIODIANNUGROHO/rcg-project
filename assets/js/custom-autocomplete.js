/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Custom Theme-Matched Autocomplete / Datalist Enhancer
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
        'UD. Garam Sejahtera Madura',
        'PT. Tambak Garam Madura'
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

      // Also merge dynamic suppliers from storage if available
      let allOptions = [...options];
      if (typeof StorageManager !== 'undefined' && StorageManager.getTransactions) {
        const txs = StorageManager.getTransactions();
        txs.forEach(t => {
          if (t.supplier && !allOptions.includes(t.supplier)) {
            allOptions.push(t.supplier);
          }
        });
      }

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
      if (!e.target.closest('.custom-autocomplete-container')) {
        document.querySelectorAll('.custom-autocomplete-container.open').forEach(w => w.classList.remove('open'));
      }
    });
  }
};
