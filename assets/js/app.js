/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Main Application Controller & UI Orchestrator
 */

const App = {
  activeTab: 'dashboard',

  init() {
    // 1. Initialize Storage & Theme State first
    try { StorageManager.init(); } catch (e) { console.error('StorageManager init error:', e); }
    try { this.initTheme(); } catch (e) { console.error('Theme init error:', e); }

    // 2. Start Live Clock & Bind Global Events immediately so UI is always active & clickable
    try { this.startLiveClock(); } catch (e) { console.error('startLiveClock error:', e); }
    try { this.bindEvents(); } catch (e) { console.error('bindEvents error:', e); }

    // 3. Initialize Subsystems safely with try-catch isolation
    try { AuthManager.init(); } catch (e) { console.error('AuthManager init error:', e); }
    try { ScaleEngine.init(); } catch (e) { console.error('ScaleEngine init error:', e); }
    try { TransactionEngine.init(); } catch (e) { console.error('TransactionEngine init error:', e); }
    try { CustomSelectManager.init(); } catch (e) { console.error('CustomSelectManager init error:', e); }
    try { CustomDatePicker.init(); } catch (e) { console.error('CustomDatePicker init error:', e); }
    try { CustomTimePicker.init(); } catch (e) { console.error('CustomTimePicker init error:', e); }
    try { CustomAutocomplete.init(); } catch (e) { console.error('CustomAutocomplete init error:', e); }
    try { HistoryManager.init(); } catch (e) { console.error('HistoryManager init error:', e); }
    try { SupplierHistoryManager.init(); } catch (e) { console.error('SupplierHistoryManager init error:', e); }
    try { AnalyticsManager.init(); } catch (e) { console.error('AnalyticsManager init error:', e); }
    try { PrintManager.init(); } catch (e) { console.error('PrintManager init error:', e); }
    try { ExportExcelManager.init(); } catch (e) { console.error('ExportExcelManager init error:', e); }

    // 4. Render Activity Logs
    try { this.renderActivityLogs(); } catch (e) { console.error('renderActivityLogs error:', e); }

    // 5. Scale Engine Subscriber for real-time form helper
    try {
      ScaleEngine.subscribe((weight, isStable, status) => {
        const liveBadge = document.getElementById('sim-live-badge');
        if (liveBadge) {
          liveBadge.textContent = `${weight.toLocaleString('id-ID')} Kg (${isStable ? 'STABIL' : 'GERAK'})`;
        }
      });
    } catch (e) {
      console.error('ScaleEngine subscribe error:', e);
    }

    // 6. Auto-backup background cron (every 15 mins)
    setInterval(() => {
      try { StorageManager.createAutoBackup(); } catch (e) {}
    }, 15 * 60 * 1000);
  },

  bindEvents() {
    // Mobile Navigation Drawer Toggle & Close
    const navToggle = document.getElementById('btn-mobile-nav-toggle');
    const navBar = document.getElementById('main-nav-bar');
    const navOverlay = document.getElementById('nav-overlay');
    const navClose = document.getElementById('btn-close-mobile-nav');

    const openNavDrawer = () => {
      if (navBar) navBar.classList.add('open');
      if (navOverlay) navOverlay.classList.add('active');
    };

    const closeNavDrawer = () => {
      if (navBar) navBar.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('active');
    };

    if (navToggle) navToggle.addEventListener('click', openNavDrawer);
    if (navClose) navClose.addEventListener('click', closeNavDrawer);
    if (navOverlay) navOverlay.addEventListener('click', closeNavDrawer);

    // Navigation Tabs
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tabId = item.getAttribute('data-tab');
        if (tabId) {
          this.switchTab(tabId);
          closeNavDrawer();
        }
      });
    });

    // User Profile Dropdown
    const profileTrigger = document.getElementById('btn-profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown-wrapper');
    if (profileTrigger && profileDropdown) {
      profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('open');
        const isOpen = profileDropdown.classList.contains('open');
        profileTrigger.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
          profileDropdown.classList.remove('open');
          profileTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Dark Mode Toggle inside Dropdown
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Scale Serial & Simulator Modals / Buttons
    const serialBtn = document.getElementById('btn-connect-serial');
    if (serialBtn) {
      serialBtn.addEventListener('click', () => {
        if (ScaleEngine.isConnected) {
          ScaleEngine.disconnectSerial();
        } else {
          this.openModal('modal-serial-connect');
        }
      });
    }

    const confirmSerialConnect = document.getElementById('btn-confirm-serial-connect');
    if (confirmSerialConnect) {
      confirmSerialConnect.addEventListener('click', () => {
        const baud = document.getElementById('serial-baud-rate').value;
        this.closeModal('modal-serial-connect');
        ScaleEngine.connectSerial(baud);
      });
    }

    const simBtn = document.getElementById('btn-toggle-sim');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        ScaleEngine.toggleSimulation();
        const simPanel = document.getElementById('sim-interactive-panel');
        if (simPanel) {
          simPanel.style.display = ScaleEngine.isSimulating ? 'block' : 'none';
        }
      });
    }

    // Simulator Interactive Controls
    const simSlider = document.getElementById('sim-weight-slider');
    if (simSlider) {
      simSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) || 0;
        ScaleEngine.setSimWeight(val);
        const simValDisplay = document.getElementById('sim-slider-val');
        if (simValDisplay) simValDisplay.textContent = `${val.toLocaleString('id-ID')} Kg`;
      });
    }

    const simPresets = document.querySelectorAll('.btn-sim-preset');
    simPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const weight = parseInt(btn.getAttribute('data-weight')) || 0;
        if (simSlider) simSlider.value = weight;
        const simValDisplay = document.getElementById('sim-slider-val');
        if (simValDisplay) simValDisplay.textContent = `${weight.toLocaleString('id-ID')} Kg`;
        ScaleEngine.setSimWeight(weight);
      });
    });

    // Auth & Logout
    const btnLogout = document.getElementById('btn-header-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('open');
        this.openModal('modal-confirm-logout');
      });
    }

    const btnConfirmLogout = document.getElementById('btn-confirm-logout-yes');
    if (btnConfirmLogout) {
      btnConfirmLogout.addEventListener('click', () => {
        this.closeModal('modal-confirm-logout');
        AuthManager.logout();
      });
    }

    // User Profile Modal Open Trigger
    const btnOpenProfile = document.getElementById('btn-open-profile');
    if (btnOpenProfile) {
      btnOpenProfile.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('open');
        this.openProfileModal();
      });
    }

    // Profile Modal Tabs Navigation
    const profileTabs = document.querySelectorAll('.profile-tab-btn');
    profileTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.profileTab;
        profileTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.profile-tab-pane').forEach(pane => pane.classList.remove('active'));
        const targetPane = document.getElementById(`pane-${targetTab}`);
        if (targetPane) targetPane.classList.add('active');
        if (targetTab === 'my-activities') {
          this.renderMyActivities();
        }
      });
    });

    // Profile Avatar Upload File Handler
    const inputAvatarFile = document.getElementById('input-avatar-file');
    if (inputAvatarFile) {
      inputAvatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          this.showToast('Ukuran foto maksimal 2MB.', 'danger');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target.result;
          AuthManager.updateAvatar(base64);
          this.syncProfileModalUI();
          this.showToast('Foto avatar berhasil diperbarui.', 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    // Profile Avatar URL Handler
    const inputAvatarUrl = document.getElementById('input-avatar-url');
    if (inputAvatarUrl) {
      inputAvatarUrl.addEventListener('change', () => {
        const url = inputAvatarUrl.value.trim();
        if (url) {
          AuthManager.updateAvatar(url);
          this.syncProfileModalUI();
          this.showToast('Avatar dari URL berhasil diterapkan.', 'success');
        }
      });
    }

    // Profile Avatar Remove Handler (Requires User Verification Dialog)
    const btnRemoveAvatar = document.getElementById('btn-remove-avatar');
    if (btnRemoveAvatar) {
      btnRemoveAvatar.addEventListener('click', () => {
        const user = AuthManager.getCurrentUser();
        if (!user.avatarUrl) {
          this.showToast('Akun ini belum menggunakan foto avatar kustom.', 'info');
          return;
        }
        this.openModal('modal-confirm-delete-avatar');
      });
    }

    const btnConfirmDeleteAvatarYes = document.getElementById('btn-confirm-delete-avatar-yes');
    if (btnConfirmDeleteAvatarYes) {
      btnConfirmDeleteAvatarYes.addEventListener('click', () => {
        this.closeModal('modal-confirm-delete-avatar');
        AuthManager.removeAvatar();
        this.syncProfileModalUI();
        this.showToast('Foto avatar berhasil dihapus.', 'info');
      });
    }

    // Profile Edit Form Submit
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      formEditProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('input-profile-fullname').value;
        const email = document.getElementById('input-profile-email').value;
        const res = AuthManager.updateProfile(fullName, email);
        if (res.success) {
          this.syncProfileModalUI();
          this.showToast('Informasi profil berhasil diperbarui.', 'success');
        }
      });
    }

    // Change Password Form Submit
    const formChangePw = document.getElementById('form-change-password');
    if (formChangePw) {
      formChangePw.addEventListener('submit', (e) => {
        e.preventDefault();
        const currPw = document.getElementById('input-curr-pw').value;
        const newPw = document.getElementById('input-new-pw').value;
        const confirmPw = document.getElementById('input-confirm-pw').value;
        if (newPw !== confirmPw) {
          this.showToast('Konfirmasi kata sandi baru tidak cocok!', 'danger');
          return;
        }
        const res = AuthManager.changePassword(currPw, newPw);
        if (res.success) {
          formChangePw.reset();
          this.showToast(res.message, 'success');
        } else {
          this.showToast(res.message, 'danger');
        }
      });
    }

    // Password Inspect Toggle in Modals
    document.querySelectorAll('.btn-inspect-pw').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetInput = document.getElementById(btn.dataset.target);
        if (targetInput) {
          const isPw = targetInput.type === 'password';
          targetInput.type = isPw ? 'text' : 'password';
          btn.style.color = isPw ? 'var(--primary)' : 'var(--text-secondary)';
        }
      });
    });

    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        const rem = document.getElementById('login-remember').checked;

        const res = AuthManager.login(u, p, rem);
        if (res.success) {
          this.closeModal('modal-login');
          this.showToast(`Selamat datang, ${res.user.fullName || res.user.username}! Login berhasil.`, 'success');
          this.renderActivityLogs();
        } else {
          this.showToast(res.message, 'danger');
        }
      });
    }

    // Modal Close Buttons
    const closeButtons = document.querySelectorAll('.modal-close-btn, .btn-modal-cancel');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal && modal.id === 'modal-user-permissions') {
          return;
        }
        if (modal && modal.id !== 'modal-login') {
          modal.classList.remove('active');
        }
      });
    });

    // Activity Log & Backup Handlers
    const btnClearLogs = document.getElementById('btn-clear-logs');
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => {
        this.openModal('modal-confirm-clear-logs');
      });
    }

    const btnConfirmClearLogsYes = document.getElementById('btn-confirm-clear-logs-yes');
    if (btnConfirmClearLogsYes) {
      btnConfirmClearLogsYes.addEventListener('click', () => {
        StorageManager.clearLogs();
        StorageManager.addLog(AuthManager.getCurrentUser().username, AuthManager.getCurrentUser().role, 'Membersihkan Seluruh Activity Log', '-');
        this.closeModal('modal-confirm-clear-logs');
        this.renderActivityLogs();
        this.showToast('Activity log berhasil dibersihkan.', 'info');
      });
    }

    const btnExportSqlite = document.getElementById('btn-export-sqlite');
    if (btnExportSqlite) {
      btnExportSqlite.addEventListener('click', async () => {
        try {
          await StorageManager.exportSQLite();
        } catch (e) {
          this.showToast(`Gagal mengunduh SQLite: ${e.message}`, 'danger');
        }
      });
    }

    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        StorageManager.exportJSON();
        this.showToast('File log JSON berhasil diunduh.', 'success');
      });
    }

    const btnExportExcel = document.getElementById('btn-export-excel');
    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', () => {
        if (typeof ExportExcelManager !== 'undefined') {
          ExportExcelManager.openExportDialog('transaction');
        } else {
          StorageManager.exportExcel();
          this.showToast('File Excel (.xlsx) berhasil diexport.', 'success');
        }
      });
    }

    const inputImportSqlite = document.getElementById('input-import-sqlite');
    if (inputImportSqlite) {
      inputImportSqlite.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          this.showToast('Memproses impor database SQLite...', 'info');
          const res = await StorageManager.importSQLite(file);
          if (res.success) {
            this.showToast(`Basis data SQLite berhasil dipulihkan! (${res.count} data transaksi)`, 'success');
            if (typeof HistoryManager !== 'undefined') HistoryManager.render();
            if (typeof SupplierHistoryManager !== 'undefined') SupplierHistoryManager.render();
            if (typeof AnalyticsManager !== 'undefined') AnalyticsManager.render();
            this.renderActivityLogs();
          } else {
            this.showToast(`Gagal mengimpor database SQLite: ${res.error || res.message}`, 'danger');
          }
        } catch (err) {
          this.showToast(`Gagal mengimpor file SQLite: ${err.message}`, 'danger');
        }
        inputImportSqlite.value = '';
      });
    }

    const inputImportJson = document.getElementById('input-import-json');
    if (inputImportJson) {
      inputImportJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const res = StorageManager.importJSON(ev.target.result);
          if (res.success) {
            this.showToast(`Berhasil mengimpor ${res.count} data transaksi!`, 'success');
            HistoryManager.render();
            AnalyticsManager.render();
            this.renderActivityLogs();
          } else {
            this.showToast(`Gagal mengimpor file: ${res.error}`, 'danger');
          }
          inputImportJson.value = '';
        };
        reader.readAsText(file);
      });
    }

    const btnRestoreBackup = document.getElementById('btn-restore-auto-backup');
    if (btnRestoreBackup) {
      btnRestoreBackup.addEventListener('click', () => {
        const success = StorageManager.restoreAutoBackup();
        if (success) {
          this.showToast('Berhasil me-restore data dari Auto-Backup terakhir!', 'success');
          HistoryManager.render();
          AnalyticsManager.render();
          this.renderActivityLogs();
        } else {
          this.showToast('Tidak ada file Auto-Backup yang ditemukan.', 'warning');
        }
      });
    }

    const btnClearAllData = document.getElementById('btn-clear-all-data');
    if (btnClearAllData) {
      btnClearAllData.addEventListener('click', () => {
        this.openModal('modal-confirm-clear-all');
      });
    }

    const btnConfirmClearAllYes = document.getElementById('btn-confirm-clear-all-yes');
    if (btnConfirmClearAllYes) {
      btnConfirmClearAllYes.addEventListener('click', () => {
        const reasonInput = document.getElementById('input-clear-all-reason');
        const reason = reasonInput ? reasonInput.value.trim() : '';

        if (!reason) {
          this.showToast('Alasan reset seluruh database wajib diisi!', 'warning');
          if (reasonInput) reasonInput.focus();
          return;
        }

        StorageManager.clearAllTransactions();
        StorageManager.addLog(
          AuthManager.getCurrentUser().username,
          AuthManager.getCurrentUser().role,
          'MENGHAPUS SELURUH DATA TRANSAKSI',
          '-',
          reason
        );
        this.closeModal('modal-confirm-clear-all');
        HistoryManager.render();
        if (typeof SupplierHistoryManager !== 'undefined') {
          SupplierHistoryManager.render();
        }
        AnalyticsManager.render();
        this.renderActivityLogs();
        this.showToast('Seluruh data transaksi telah dihapus bersih.', 'danger');
      });
    }

    // Modal Delete Transaction Confirmation Button
    const btnConfirmDeleteTrx = document.getElementById('btn-confirm-delete-trx');
    if (btnConfirmDeleteTrx) {
      btnConfirmDeleteTrx.addEventListener('click', () => {
        HistoryManager.executeDelete();
      });
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav bar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update View Sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => {
      if (sec.id === `section-${tabId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Refresh charts if entering dashboard
    if (tabId === 'dashboard') {
      AnalyticsManager.render();
    } else if (tabId === 'riwayat') {
      HistoryManager.render();
    } else if (tabId === 'riwayat-pemasok') {
      SupplierHistoryManager.render();
    } else if (tabId === 'activity-log') {
      this.renderActivityLogs();
    }
  },

  startLiveClock() {
    const clockEl = document.getElementById('header-live-clock');
    const updateClock = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      if (clockEl) {
        clockEl.textContent = `${now.toLocaleString('id-ID', options)} WIB`;
      }
    };
    updateClock();
    setInterval(updateClock, 1000);
  },

  initTheme() {
    const settings = StorageManager.getSettings();
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
      this.updateThemeButton(true);
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
      this.updateThemeButton(false);
    }
  },

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode', isDark);
    const settings = StorageManager.getSettings();
    settings.darkMode = isDark;
    StorageManager.saveSettings(settings);
    this.updateThemeButton(isDark);
    if (typeof AnalyticsManager !== 'undefined') {
      AnalyticsManager.render();
    }
  },

  updateThemeButton(isDark) {
    const themeText = document.getElementById('menu-theme-text');
    if (themeText) {
      themeText.textContent = isDark ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)';
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Reset container to prevent multiple overlapping toasts
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    toast.innerHTML = `
      <div class="toast-content">
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  },

  renderActivityLogs() {
    const tbody = document.getElementById('activity-log-table-body');
    if (!tbody) return;

    const logs = StorageManager.getLogs();
    tbody.innerHTML = '';

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
            Belum ada catatan aktivitas.
          </td>
        </tr>
      `;
      return;
    }

    logs.forEach(log => {
      const tr = document.createElement('tr');
      const hasReason = log.reason && log.reason !== '-';
      tr.innerHTML = `
        <td class="mono-num">${log.time}</td>
        <td><strong>${log.user}</strong></td>
        <td><span class="role-text ${log.role === 'Administrator' ? 'role-admin' : (log.role === 'Supervisor' ? 'role-supervisor' : 'role-operator')}">${log.role}</span></td>
        <td>${log.activity}</td>
        <td class="mono-num">${log.docNo || '-'}</td>
        <td>${hasReason ? `<span class="badge badge-warning" style="font-weight: 600; white-space: normal; text-align: left;">${log.reason}</span>` : '<span class="text-secondary">-</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  openProfileModal() {
    this.syncProfileModalUI();
    // Default to first tab
    const firstTab = document.querySelector('.profile-tab-btn[data-profile-tab="personal-info"]');
    if (firstTab) firstTab.click();
    this.openModal('modal-user-profile');
  },

  syncProfileModalUI() {
    const user = AuthManager.getCurrentUser();
    const vAvatar = document.getElementById('profile-view-avatar');
    const eAvatar = document.getElementById('profile-edit-avatar-preview');
    const vFullName = document.getElementById('profile-view-fullname');
    const vEmail = document.getElementById('profile-view-email');
    const vRole = document.getElementById('profile-view-role');
    const vUsername = document.getElementById('profile-view-username');
    const vRoleText = document.getElementById('profile-view-role-text');
    const vCreated = document.getElementById('profile-view-created');
    const inputFullName = document.getElementById('input-profile-fullname');
    const inputEmail = document.getElementById('input-profile-email');
    const inputAvatarUrl = document.getElementById('input-avatar-url');

    const avatarContent = user.avatarUrl
      ? `<img src="${user.avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
      : (user.initials || 'AD');

    if (vAvatar) vAvatar.innerHTML = avatarContent;
    if (eAvatar) eAvatar.innerHTML = avatarContent;
    if (vFullName) vFullName.textContent = user.fullName || user.username;
    if (vEmail) vEmail.textContent = user.email || '-';
    if (vRole) vRole.textContent = user.role;
    if (vUsername) vUsername.textContent = user.username;
    if (vRoleText) vRoleText.textContent = user.role === 'Administrator' ? 'Administrator Sistem' : (user.role === 'Supervisor' ? 'Supervisor Pengawas' : 'Operator Penimbangan');
    if (vCreated) vCreated.textContent = user.createdAt || '2026-08-01 08:00';
    if (inputFullName) inputFullName.value = user.fullName || '';
    if (inputEmail) inputEmail.value = user.email || '';
    if (inputAvatarUrl) inputAvatarUrl.value = (user.avatarUrl && !user.avatarUrl.startsWith('data:')) ? user.avatarUrl : '';
  },

  renderMyActivities() {
    const listElem = document.getElementById('profile-my-activities-list');
    if (!listElem) return;
    const user = AuthManager.getCurrentUser();
    const acts = AuthManager.getUserActivities(user.username).slice(0, 10);
    if (acts.length === 0) {
      listElem.innerHTML = `<div style="text-align: center; padding: 18px; color: var(--text-secondary); font-size: 12.5px;">Belum ada riwayat aktivitas.</div>`;
      return;
    }
    listElem.innerHTML = acts.map(act => `
      <div class="my-activity-item">
        <div class="act-text">${act.activity} ${act.docNo && act.docNo !== '-' ? `<span class="mono-num" style="color: var(--primary);">(${act.docNo})</span>` : ''}</div>
        <div class="act-time mono-num">${act.time}</div>
      </div>
    `).join('');
  }
};

// Initialize when DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
