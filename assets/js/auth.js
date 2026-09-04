/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Authentication, RBAC & User Management
 */

const DEFAULT_PERMISSIONS_ADMIN = {
  supplier: { view: true, add: true, edit: true, delete: true },
  material: { view: true, add: true, edit: true, delete: true },
  transaction: { view: true, add: true, edit: true, delete: true },
  report: { view: true, export: true },
  reprintNota: true,
  changeSettings: true,
  manageUsers: true,
  backupDatabase: true
};

const DEFAULT_PERMISSIONS_OPERATOR = {
  supplier: { view: true, add: true, edit: true, delete: false },
  material: { view: true, add: false, edit: false, delete: false },
  transaction: { view: true, add: true, edit: true, delete: false },
  report: { view: true, export: true },
  reprintNota: true,
  changeSettings: false,
  manageUsers: false,
  backupDatabase: false
};

const DEFAULT_PERMISSIONS_SUPERVISOR = {
  supplier: { view: true, add: true, edit: true, delete: false },
  material: { view: true, add: false, edit: false, delete: false },
  transaction: { view: true, add: true, edit: true, delete: false },
  report: { view: true, export: true },
  reprintNota: true,
  changeSettings: false,
  manageUsers: false,
  backupDatabase: false
};

const DEFAULT_USERS = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator RCG',
    email: 'admin@rekaciptagaram.co.id',
    role: 'Administrator',
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_ADMIN)),
    avatarUrl: null,
    initials: 'AD',
    createdAt: '2026-08-01 08:00'
  },
  {
    id: 'USR-002',
    username: 'operator',
    password: 'operator123',
    fullName: 'Operator Timbang',
    email: 'operator@rekaciptagaram.co.id',
    role: 'Operator',
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_OPERATOR)),
    avatarUrl: null,
    initials: 'OP',
    createdAt: '2026-08-15 09:30'
  },
  {
    id: 'USR-003',
    username: 'supervisor',
    password: 'supervisor123',
    fullName: 'Supervisor Pengawas',
    email: 'supervisor@rekaciptagaram.co.id',
    role: 'Supervisor',
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_SUPERVISOR)),
    avatarUrl: null,
    initials: 'SP',
    createdAt: '2026-08-20 10:00'
  }
];

const AuthManager = {
  currentUser: null,
  selectedPermUserId: null,

  notify(message, type = 'info') {
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(message, type);
    } else {
      console.log(`[Toast ${type}] ${message}`);
    }
  },

  getUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    try {
      const users = JSON.parse(raw);
      // Ensure all users have permissions structure
      users.forEach(u => {
        if (!u.permissions) {
          if (u.role === 'Administrator') {
            u.permissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_ADMIN));
          } else if (u.role === 'Supervisor' || u.role === 'Viewer') {
            u.permissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_SUPERVISOR));
          } else {
            u.permissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_OPERATOR));
          }
        } else if (u.role === 'Supervisor' && u.permissions.transaction && u.permissions.transaction.add === false && !u.customPermissionsSaved) {
          u.permissions.transaction.add = true;
          u.permissions.transaction.edit = true;
          u.permissions.supplier.add = true;
          u.permissions.supplier.edit = true;
        }
      });
      // Ensure default supervisor user exists if not already present
      if (!users.some(u => u.username.toLowerCase() === 'supervisor')) {
        const sup = DEFAULT_USERS.find(u => u.username === 'supervisor');
        if (sup) {
          users.push(JSON.parse(JSON.stringify(sup)));
        }
      }
      this.saveUsers(users);
      return users;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  init() {
    // 1. Ensure user DB exists
    const users = this.getUsers();

    // 2. Check active saved session in localStorage
    const rawSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (rawSession) {
      try {
        const sessionUser = JSON.parse(rawSession);
        const freshUser = users.find(u => u.username.toLowerCase() === sessionUser.username.toLowerCase());
        this.currentUser = freshUser || sessionUser;
        if (this.currentUser && this.currentUser.role === 'Supervisor' && this.currentUser.permissions?.transaction?.add === false && !this.currentUser.customPermissionsSaved) {
          this.currentUser.permissions.transaction.add = true;
          this.currentUser.permissions.transaction.edit = true;
          this.saveSession(true);
        }
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }

    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.href.includes('login.html');

    // If on protected page without session, redirect to login
    if (!this.currentUser && !isLoginPage) {
      window.location.href = 'login.html';
      return;
    }

    this.updateUserUI();
    this.bindPermissionsEvents();
  },

  login(username, password, remember = true) {
    const users = this.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
      
      if (remember) {
        localStorage.setItem('rcg_remembered_username', user.username);
      } else {
        localStorage.removeItem('rcg_remembered_username');
      }

      StorageManager.addLog(user.username, user.role, 'Login Aplikasi Berhasil', '-');
      this.updateUserUI();
      return { success: true, user };
    }
    return { success: false, message: 'Username atau password salah!' };
  },

  logout() {
    if (this.currentUser) {
      StorageManager.addLog(this.currentUser.username, this.currentUser.role, 'Logout dari Aplikasi', '-');
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    window.location.href = 'login.html';
  },

  saveSession(remember = true) {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(this.currentUser));
    }
  },

  getCurrentUser() {
    if (!this.currentUser) {
      const users = this.getUsers();
      return users[0];
    }
    return this.currentUser;
  },

  isAdmin() {
    return this.currentUser && (this.currentUser.role === 'Administrator' || this.can('manageUsers'));
  },

  isSupervisor() {
    return this.currentUser && (this.currentUser.role === 'Supervisor' || this.currentUser.role === 'Viewer');
  },

  isOperator() {
    return this.currentUser && this.currentUser.role === 'Operator';
  },

  canAddTransaction() {
    return this.can('transaction.add');
  },

  canEditTransaction() {
    return this.can('transaction.edit');
  },

  canDeleteTransaction() {
    return this.can('transaction.delete');
  },

  canChangePaymentStatus() {
    return this.can('transaction.edit');
  },

  can(privilegeName) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    if (!user.permissions) return false;

    // Direct system privilege boolean
    if (typeof user.permissions[privilegeName] === 'boolean') {
      return user.permissions[privilegeName];
    }

    // Category.action format e.g. "transaction.delete"
    if (privilegeName.includes('.')) {
      const [cat, act] = privilegeName.split('.');
      return !!(user.permissions[cat] && user.permissions[cat][act]);
    }

    return false;
  },

  updateProfile(fullName, email) {
    if (!this.currentUser) return { success: false, message: 'Sesi tidak valid.' };
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === this.currentUser.username);
    if (index === -1) return { success: false, message: 'User tidak ditemukan.' };

    users[index].fullName = fullName.trim() || users[index].fullName;
    users[index].email = email.trim() || users[index].email;
    
    // Generate initials
    const parts = users[index].fullName.split(' ').filter(Boolean);
    users[index].initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : parts[0].substring(0, 2).toUpperCase();

    this.currentUser = users[index];
    this.saveUsers(users);
    this.saveSession(true);

    StorageManager.addLog(this.currentUser.username, this.currentUser.role, 'Memperbarui Informasi Profil Pengguna', '-');
    this.updateUserUI();
    return { success: true, user: this.currentUser };
  },

  updateAvatar(avatarUrlOrBase64) {
    if (!this.currentUser) return { success: false, message: 'Sesi tidak valid.' };
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === this.currentUser.username);
    if (index === -1) return { success: false, message: 'User tidak ditemukan.' };

    users[index].avatarUrl = avatarUrlOrBase64;
    this.currentUser = users[index];
    this.saveUsers(users);
    this.saveSession(true);

    StorageManager.addLog(this.currentUser.username, this.currentUser.role, 'Memperbarui Foto Avatar Pengguna', '-');
    this.updateUserUI();
    return { success: true, user: this.currentUser };
  },

  removeAvatar() {
    if (!this.currentUser) return { success: false, message: 'Sesi tidak valid.' };
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === this.currentUser.username);
    if (index === -1) return { success: false, message: 'User tidak ditemukan.' };

    users[index].avatarUrl = null;
    this.currentUser = users[index];
    this.saveUsers(users);
    this.saveSession(true);

    StorageManager.addLog(this.currentUser.username, this.currentUser.role, 'Menghapus Foto Avatar Pengguna', '-');
    this.updateUserUI();
    return { success: true, user: this.currentUser };
  },

  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) return { success: false, message: 'Sesi tidak valid.' };
    if (this.currentUser.password !== currentPassword) {
      return { success: false, message: 'Kata sandi saat ini tidak cocok!' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.username === this.currentUser.username);
    if (index === -1) return { success: false, message: 'User tidak ditemukan.' };

    users[index].password = newPassword;
    this.currentUser = users[index];
    this.saveUsers(users);
    this.saveSession(true);

    StorageManager.addLog(this.currentUser.username, this.currentUser.role, 'Mengubah Kata Sandi Akun', '-');
    return { success: true, message: 'Kata sandi berhasil diperbarui!' };
  },

  // =========================================================================
  // RBAC & User Permissions Management Methods
  // =========================================================================

  createUser(userData) {
    const users = this.getUsers();
    const exists = users.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase());
    if (exists) {
      return { success: false, message: `Username "${userData.username}" sudah digunakan!` };
    }

    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const parts = (userData.fullName || userData.username).split(' ').filter(Boolean);
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : parts[0].substring(0, 2).toUpperCase();

    let defaultPerm = DEFAULT_PERMISSIONS_OPERATOR;
    if (userData.role === 'Administrator') defaultPerm = DEFAULT_PERMISSIONS_ADMIN;
    else if (userData.role === 'Supervisor' || userData.role === 'Viewer') defaultPerm = DEFAULT_PERMISSIONS_SUPERVISOR;

    const permissions = userData.permissions || JSON.parse(JSON.stringify(defaultPerm));

    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newUser = {
      id: newId,
      username: userData.username.trim(),
      password: userData.password || '123456',
      fullName: userData.fullName || userData.username,
      email: userData.email || `${userData.username.toLowerCase()}@rekaciptagaram.co.id`,
      role: userData.role || 'Operator',
      permissions: permissions,
      avatarUrl: null,
      initials: initials,
      createdAt: createdAt
    };

    users.push(newUser);
    this.saveUsers(users);

    StorageManager.addLog(
      this.currentUser ? this.currentUser.username : 'admin',
      this.currentUser ? this.currentUser.role : 'Administrator',
      `Menambahkan Pengguna Baru: ${newUser.username} (${newUser.role})`,
      '-'
    );

    return { success: true, user: newUser };
  },

  adminResetUserPassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter.' };
    }
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    target.password = newPassword;
    this.saveUsers(users);

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.password = newPassword;
      this.saveSession(true);
    }

    StorageManager.addLog(
      this.currentUser ? this.currentUser.username : 'admin',
      this.currentUser ? this.currentUser.role : 'Administrator',
      `Mengubah Password User: ${target.username}`,
      '-'
    );

    return { success: true, message: `Password untuk user "${target.username}" berhasil diperbarui.` };
  },

  deleteUser(userId) {
    const users = this.getUsers();
    const targetIndex = users.findIndex(u => u.id === userId);
    if (targetIndex === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    const target = users[targetIndex];
    if (target.username.toLowerCase() === 'admin') {
      return { success: false, message: 'Akun Super Admin bawaan tidak dapat dihapus!' };
    }
    if (this.currentUser && this.currentUser.id === userId) {
      return { success: false, message: 'Anda tidak dapat menghapus akun yang sedang aktif digunakan!' };
    }

    users.splice(targetIndex, 1);
    this.saveUsers(users);

    StorageManager.addLog(
      this.currentUser ? this.currentUser.username : 'admin',
      this.currentUser ? this.currentUser.role : 'Administrator',
      `Menghapus Akun Pengguna: ${target.username}`,
      '-'
    );

    return { success: true, message: `Pengguna "${target.username}" berhasil dihapus.` };
  },

  saveUserPermissions(userId, role, permissions) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    target.role = role || target.role;
    target.permissions = permissions;
    target.customPermissionsSaved = true;
    this.saveUsers(users);

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.role = target.role;
      this.currentUser.permissions = permissions;
      this.currentUser.customPermissionsSaved = true;
      this.saveSession(true);
      this.updateUserUI();
    }

    if (typeof HistoryManager !== 'undefined' && HistoryManager.render) {
      HistoryManager.render();
    }
    if (typeof SupplierHistoryManager !== 'undefined' && SupplierHistoryManager.render) {
      SupplierHistoryManager.render();
    }

    StorageManager.addLog(
      this.currentUser ? this.currentUser.username : 'admin',
      this.currentUser ? this.currentUser.role : 'Administrator',
      `Memperbarui Hak Akses untuk Pengguna: ${target.username} (${target.role})`,
      '-'
    );

    return { success: true, message: `Hak akses untuk "${target.username}" berhasil disimpan!` };
  },

  openPermissionsModal() {
    const modal = document.getElementById('modal-user-permissions');
    if (!modal) return;

    this.renderPermissionsUserList();
    modal.classList.add('active');
  },

  renderPermissionsUserList(filterKeyword = '') {
    const tbody = document.getElementById('perm-user-list-tbody');
    if (!tbody) return;

    const users = this.getUsers();
    const filtered = filterKeyword 
      ? users.filter(u => u.username.toLowerCase().includes(filterKeyword.toLowerCase()) || u.fullName.toLowerCase().includes(filterKeyword.toLowerCase()) || u.role.toLowerCase().includes(filterKeyword.toLowerCase()))
      : users;

    tbody.innerHTML = '';
    filtered.forEach(u => {
      const isSelected = this.selectedPermUserId === u.id || (!this.selectedPermUserId && u.username === 'admin');
      if (isSelected && !this.selectedPermUserId) {
        this.selectedPermUserId = u.id;
      }

      const tr = document.createElement('tr');
      tr.className = `perm-user-row ${isSelected ? 'active-user' : ''}`;
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td style="font-weight: 600;">${u.username}</td>
        <td><span class="role-text ${u.role === 'Administrator' ? 'role-admin' : (u.role === 'Supervisor' ? 'role-supervisor' : 'role-operator')}">${u.role}</span></td>
      `;
      tr.addEventListener('click', () => {
        this.selectedPermUserId = u.id;
        document.querySelectorAll('.perm-user-row').forEach(r => r.classList.remove('active-user'));
        tr.classList.add('active-user');
        this.loadUserPermissionsToForm(u.id);
      });
      tbody.appendChild(tr);
    });

    if (this.selectedPermUserId) {
      this.loadUserPermissionsToForm(this.selectedPermUserId);
    }
  },

  applyPermissionsTemplateToForm(p) {
    const setCb = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    };

    setCb('perm-supplier-view', p.supplier?.view);
    setCb('perm-supplier-add', p.supplier?.add);
    setCb('perm-supplier-edit', p.supplier?.edit);
    setCb('perm-supplier-delete', p.supplier?.delete);

    setCb('perm-material-view', p.material?.view);
    setCb('perm-material-add', p.material?.add);
    setCb('perm-material-edit', p.material?.edit);
    setCb('perm-material-delete', p.material?.delete);

    setCb('perm-tx-view', p.transaction?.view);
    setCb('perm-tx-add', p.transaction?.add);
    setCb('perm-tx-edit', p.transaction?.edit);
    setCb('perm-tx-delete', p.transaction?.delete);

    setCb('perm-report-view', p.report?.view);
    setCb('perm-report-export', p.report?.export);

    setCb('perm-sys-reprint', p.reprintNota);
    setCb('perm-sys-settings', p.changeSettings);
    setCb('perm-sys-manage-users', p.manageUsers);
    setCb('perm-sys-backup', p.backupDatabase);
  },

  loadUserPermissionsToForm(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    if (!user) return;

    const titleElem = document.getElementById('perm-selected-user-title');
    if (titleElem) titleElem.textContent = `Hak Akses : ${user.username} (${user.fullName})`;

    const roleSelect = document.getElementById('perm-user-role-select');
    if (roleSelect) {
      roleSelect.value = user.role;
      if (window.CustomSelect) window.CustomSelect.sync(roleSelect);
    }

    let defaultP = DEFAULT_PERMISSIONS_OPERATOR;
    if (user.role === 'Administrator') defaultP = DEFAULT_PERMISSIONS_ADMIN;
    else if (user.role === 'Supervisor' || user.role === 'Viewer') defaultP = DEFAULT_PERMISSIONS_SUPERVISOR;

    const p = user.permissions || defaultP;
    this.applyPermissionsTemplateToForm(p);
  },

  collectPermissionsFromForm() {
    const getCb = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    };

    return {
      supplier: {
        view: getCb('perm-supplier-view'),
        add: getCb('perm-supplier-add'),
        edit: getCb('perm-supplier-edit'),
        delete: getCb('perm-supplier-delete')
      },
      material: {
        view: getCb('perm-material-view'),
        add: getCb('perm-material-add'),
        edit: getCb('perm-material-edit'),
        delete: getCb('perm-material-delete')
      },
      transaction: {
        view: getCb('perm-tx-view'),
        add: getCb('perm-tx-add'),
        edit: getCb('perm-tx-edit'),
        delete: getCb('perm-tx-delete')
      },
      report: {
        view: getCb('perm-report-view'),
        export: getCb('perm-report-export')
      },
      reprintNota: getCb('perm-sys-reprint'),
      changeSettings: getCb('perm-sys-settings'),
      manageUsers: getCb('perm-sys-manage-users'),
      backupDatabase: getCb('perm-sys-backup')
    };
  },

  setAllPermissions(checked = true) {
    const matrixContainer = document.getElementById('perm-matrix-container');
    if (!matrixContainer) return;
    matrixContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = checked;
    });
  },

  bindPermissionsEvents() {
    // Open Permissions Modal button from Backup/Data section
    const btnOpenPerm = document.getElementById('btn-open-permissions-manager');
    if (btnOpenPerm) {
      btnOpenPerm.addEventListener('click', () => this.openPermissionsModal());
    }

    // Filter user search in permissions modal
    const inputSearchUser = document.getElementById('perm-user-search-input');
    if (inputSearchUser) {
      inputSearchUser.addEventListener('input', (e) => {
        this.renderPermissionsUserList(e.target.value);
      });
    }

    // Select All / Clear All
    const btnSelectAll = document.getElementById('btn-perm-select-all');
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => this.setAllPermissions(true));
    }
    const btnClearAll = document.getElementById('btn-perm-clear-all');
    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => this.setAllPermissions(false));
    }

    // Auto-preset permissions when role dropdown changes in modal
    const roleSelect = document.getElementById('perm-user-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const newRole = e.target.value;
        if (newRole === 'Administrator') {
          this.applyPermissionsTemplateToForm(DEFAULT_PERMISSIONS_ADMIN);
        } else if (newRole === 'Supervisor' || newRole === 'Viewer') {
          this.applyPermissionsTemplateToForm(DEFAULT_PERMISSIONS_SUPERVISOR);
        } else if (newRole === 'Operator') {
          this.applyPermissionsTemplateToForm(DEFAULT_PERMISSIONS_OPERATOR);
        }
      });
    }

    // Save Permissions
    const btnSavePerm = document.getElementById('btn-save-permissions');
    if (btnSavePerm) {
      btnSavePerm.addEventListener('click', () => {
        if (!this.selectedPermUserId) {
          this.notify('Pilih pengguna terlebih dahulu.', 'warning');
          return;
        }
        const roleSelect = document.getElementById('perm-user-role-select');
        const newRole = roleSelect ? roleSelect.value : 'Operator';
        const perms = this.collectPermissionsFromForm();

        const res = this.saveUserPermissions(this.selectedPermUserId, newRole, perms);
        if (res.success) {
          this.notify(res.message, 'success');
          this.renderPermissionsUserList();
        } else {
          this.notify(res.message, 'danger');
        }
      });
    }

    // Add User Modal
    const btnAddUser = document.getElementById('btn-perm-add-user');
    if (btnAddUser) {
      btnAddUser.addEventListener('click', () => {
        const modalAdd = document.getElementById('modal-add-user');
        if (modalAdd) {
          const form = document.getElementById('form-add-new-user');
          if (form) form.reset();
          modalAdd.classList.add('active');
        }
      });
    }

    const formAddNewUser = document.getElementById('form-add-new-user');
    if (formAddNewUser) {
      formAddNewUser.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('input-add-user-username').value;
        const fullName = document.getElementById('input-add-user-fullname').value;
        const email = document.getElementById('input-add-user-email').value;
        const password = document.getElementById('input-add-user-password').value;
        const role = document.getElementById('input-add-user-role').value;

        const res = this.createUser({ username, fullName, email, password, role });
        if (res.success) {
          this.notify(`Pengguna "${username}" berhasil ditambahkan!`, 'success');
          document.getElementById('modal-add-user')?.classList.remove('active');
          this.selectedPermUserId = res.user.id;
          this.renderPermissionsUserList();
        } else {
          this.notify(res.message, 'danger');
        }
      });
    }

    // Edit Pass Modal (Admin reset password)
    const btnEditPass = document.getElementById('btn-perm-edit-pass');
    if (btnEditPass) {
      btnEditPass.addEventListener('click', () => {
        if (!this.selectedPermUserId) {
          this.notify('Pilih pengguna yang ingin diubah kata sandinya.', 'warning');
          return;
        }
        const users = this.getUsers();
        const target = users.find(u => u.id === this.selectedPermUserId);
        if (!target) return;

        const modalPass = document.getElementById('modal-admin-edit-pass');
        const targetLabel = document.getElementById('admin-edit-pass-target-username');
        if (targetLabel) targetLabel.textContent = `${target.username} (${target.fullName})`;
        if (modalPass) {
          const inputPw = document.getElementById('input-admin-new-password');
          if (inputPw) inputPw.value = '';
          modalPass.classList.add('active');
        }
      });
    }

    const formAdminEditPass = document.getElementById('form-admin-edit-pass');
    if (formAdminEditPass) {
      formAdminEditPass.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPw = document.getElementById('input-admin-new-password').value;
        const res = this.adminResetUserPassword(this.selectedPermUserId, newPw);
        if (res.success) {
          this.notify(res.message, 'success');
          document.getElementById('modal-admin-edit-pass')?.classList.remove('active');
        } else {
          this.notify(res.message, 'danger');
        }
      });
    }

    // Delete User Confirmation Modal
    const btnDelUser = document.getElementById('btn-perm-del-user');
    if (btnDelUser) {
      btnDelUser.addEventListener('click', () => {
        if (!this.selectedPermUserId) {
          this.notify('Pilih pengguna yang ingin dihapus.', 'warning');
          return;
        }
        const users = this.getUsers();
        const target = users.find(u => u.id === this.selectedPermUserId);
        if (!target) return;

        const modalDel = document.getElementById('modal-confirm-delete-user');
        const targetLabel = document.getElementById('delete-user-target-name');
        if (targetLabel) targetLabel.textContent = `"${target.username}" (${target.fullName})`;
        if (modalDel) {
          modalDel.classList.add('active');
        }
      });
    }

    const btnConfirmDelUserYes = document.getElementById('btn-confirm-delete-user-yes');
    if (btnConfirmDelUserYes) {
      btnConfirmDelUserYes.addEventListener('click', () => {
        if (!this.selectedPermUserId) return;
        const res = this.deleteUser(this.selectedPermUserId);
        document.getElementById('modal-confirm-delete-user')?.classList.remove('active');
        if (res.success) {
          this.notify(res.message, 'success');
          this.selectedPermUserId = null;
          this.renderPermissionsUserList();
        } else {
          this.notify(res.message, 'danger');
        }
      });
    }
  },

  updateUserUI() {
    const user = this.getCurrentUser();
    if (!user) return;

    const nameElem = document.getElementById('user-display-name');
    const roleElem = document.getElementById('user-display-role');
    const avatarElem = document.getElementById('user-avatar-text');

    if (nameElem) nameElem.textContent = user.username;
    if (roleElem) roleElem.textContent = user.role;
    
    // Header Avatar Rendering (Image or Initials)
    if (avatarElem) {
      if (user.avatarUrl) {
        avatarElem.innerHTML = `<img src="${user.avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarElem.textContent = user.initials || (user.role === 'Supervisor' ? 'SP' : (user.role === 'Operator' ? 'OP' : 'AD'));
      }
    }

    const menuName = document.getElementById('menu-user-name');
    const menuRole = document.getElementById('menu-user-role');
    if (menuName) menuName.textContent = user.fullName || user.username;
    if (menuRole) menuRole.textContent = `${user.role} RCG`;

    // Admin-only elements visibility
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = this.isAdmin() ? '' : 'none';
    });

    // Transaction form UI adjustments (Dynamic permission check)
    const canAddTx = this.canAddTransaction();
    const btnSaveTx = document.getElementById('btn-save-transaction');
    if (btnSaveTx) {
      if (!canAddTx) {
        btnSaveTx.disabled = true;
        btnSaveTx.style.opacity = '0.55';
        btnSaveTx.style.cursor = 'not-allowed';
        btnSaveTx.setAttribute('title', 'Akun Anda tidak memiliki hak akses untuk menambah atau menyimpan transaksi');
      } else {
        btnSaveTx.disabled = false;
        btnSaveTx.style.opacity = '1';
        btnSaveTx.style.cursor = 'pointer';
        btnSaveTx.removeAttribute('title');
      }
    }

    const draftMsg = document.getElementById('transaction-draft-msg');
    if (draftMsg) {
      if (!canAddTx) {
        draftMsg.textContent = 'Mode Terbatas: Hak akses akun Anda saat ini hanya untuk melihat data (Read-Only).';
        draftMsg.style.color = 'var(--accent-gold)';
      } else {
        draftMsg.textContent = 'Draf penimbangan baru siap digunakan.';
        draftMsg.style.color = '';
      }
    }
  }
};
