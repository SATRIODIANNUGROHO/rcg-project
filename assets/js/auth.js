/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Authentication & User Profile Management (Modular Architecture)
 */

const DEFAULT_USERS = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator RCG',
    email: 'admin@rekaciptagaram.co.id',
    role: 'Administrator',
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
    avatarUrl: null,
    initials: 'OP',
    createdAt: '2026-08-15 09:30'
  }
];

const AuthManager = {
  currentUser: null,

  getUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
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

    // 2. Check active saved session in localStorage (reliable across file:// protocol)
    const rawSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (rawSession) {
      try {
        const sessionUser = JSON.parse(rawSession);
        const freshUser = users.find(u => u.username === sessionUser.username);
        this.currentUser = freshUser || sessionUser;
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
    return this.currentUser && this.currentUser.role === 'Administrator';
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

  getUserActivities(username) {
    const targetUser = username || (this.currentUser ? this.currentUser.username : '');
    const allLogs = StorageManager.getActivityLogs();
    return allLogs.filter(log => log.user.toLowerCase() === targetUser.toLowerCase());
  },

  updateUserUI() {
    const user = this.getCurrentUser();
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
        avatarElem.textContent = user.initials || 'AD';
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
  }
};
