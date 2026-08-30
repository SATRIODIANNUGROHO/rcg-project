/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Serial Weighing Scale Hardware Driver & Virtual Scale Simulator
 */

const ScaleEngine = {
  currentWeight: 0,
  isStable: true,
  isConnected: false,
  isSimulating: false,
  activePort: null,
  portReader: null,
  subscribers: [],
  simInterval: null,
  simBaseWeight: 0,
  simJitter: 0,

  init() {
    this.updateUI();
  },

  // Subscribe to weight changes
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
    }
  },

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.currentWeight, this.isStable, this.getStatus());
      } catch (e) {
        console.error('Subscriber error', e);
      }
    });
    this.updateUI();
  },

  getStatus() {
    if (this.isSimulating) return 'SIMULATING';
    if (this.isConnected) return 'CONNECTED';
    return 'DISCONNECTED';
  },

  // ==========================================
  // REAL HARDWARE SERIAL PORT (Web Serial API)
  // ==========================================
  async connectSerial(baudRate = 9600) {
    if (!('serial' in navigator)) {
      App.showToast('Browser atau sistem ini tidak mendukung Web Serial API', 'warning');
      return false;
    }

    try {
      this.activePort = await navigator.serial.requestPort();
      await this.activePort.open({ baudRate: parseInt(baudRate) || 9600 });
      this.isConnected = true;
      this.isSimulating = false;
      this.stopSimulation();
      this.readSerialStream();
      App.showToast('Timbangan Serial Berhasil Terhubung!', 'success');
      StorageManager.addLog(AuthManager.getCurrentUser().username, AuthManager.getCurrentUser().role, 'Koneksi Timbangan Serial Terhubung (Port COM)', '-');
      this.notifySubscribers();
      return true;
    } catch (err) {
      console.warn('Serial connect cancelled or failed:', err);
      if (err.name !== 'NotFoundError') {
        App.showToast(`Gagal menghubungkan serial: ${err.message}`, 'danger');
      }
      return false;
    }
  },

  async disconnectSerial() {
    try {
      if (this.portReader) {
        await this.portReader.cancel();
        this.portReader = null;
      }
      if (this.activePort) {
        await this.activePort.close();
        this.activePort = null;
      }
      this.isConnected = false;
      App.showToast('Koneksi Timbangan Serial Terputus', 'info');
      StorageManager.addLog(AuthManager.getCurrentUser().username, AuthManager.getCurrentUser().role, 'Koneksi Timbangan Serial Terputus', '-');
      this.notifySubscribers();
    } catch (e) {
      console.error('Disconnect error', e);
    }
  },

  async readSerialStream() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.activePort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    this.portReader = reader;

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep partial line in buffer

          for (const line of lines) {
            this.parseScaleData(line.trim());
          }
        }
      }
    } catch (error) {
      console.warn('Serial read loop ended:', error);
    } finally {
      reader.releaseLock();
    }
  },

  // Parse Standard Weighing Indicator ASCII Protocol (e.g. ST,GS,+012500kg / Yaohua A12E / CAS / Toledo)
  parseScaleData(rawString) {
    if (!rawString) return;
    
    // Look for numbers with optional decimal and sign
    // Common formats: "ST,GS,+016500kg" or "=016500" or "  16500 kg"
    const match = rawString.match(/([-+]?\s*\d+(\.\d+)?)/);
    if (match) {
      const cleanNum = parseFloat(match[0].replace(/\s+/g, ''));
      if (!isNaN(cleanNum)) {
        this.currentWeight = Math.round(cleanNum);
        this.isStable = rawString.includes('ST') || !rawString.includes('US');
        this.notifySubscribers();
      }
    }
  },

  // ==========================================
  // VIRTUAL SCALE SIMULATOR ENGINE
  // ==========================================
  toggleSimulation() {
    if (this.isSimulating) {
      this.stopSimulation();
      App.showToast('Mode Simulasi Timbangan Dinonaktifkan', 'info');
    } else {
      if (this.isConnected) this.disconnectSerial();
      this.startSimulation();
      App.showToast('Mode Simulasi Timbangan Aktif', 'warning');
    }
  },

  startSimulation() {
    this.isSimulating = true;
    this.isConnected = false;
    if (this.simBaseWeight === 0) this.simBaseWeight = 16500; // default initial demo weight

    if (this.simInterval) clearInterval(this.simInterval);

    this.simInterval = setInterval(() => {
      // Add realistic minor industrial scale flutter (+/- 5 kg)
      const jitter = (Math.random() - 0.5) * 6;
      this.currentWeight = Math.max(0, Math.round(this.simBaseWeight + jitter));
      this.isStable = Math.abs(jitter) < 2.5;
      this.notifySubscribers();
    }, 400);

    this.notifySubscribers();
  },

  stopSimulation() {
    this.isSimulating = false;
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.currentWeight = 0;
    this.notifySubscribers();
  },

  setSimWeight(weightKg) {
    this.simBaseWeight = Math.max(0, parseInt(weightKg) || 0);
    this.currentWeight = this.simBaseWeight;
    this.notifySubscribers();
  },

  // UI Updates for the Top Indicator Card
  updateUI() {
    const card = document.getElementById('main-scale-card');
    const statusTitle = document.getElementById('scale-status-title');
    const statusDesc = document.getElementById('scale-status-desc');
    const weightDisplay = document.getElementById('scale-live-weight');
    const simBtn = document.getElementById('btn-toggle-sim');
    const serialBtn = document.getElementById('btn-connect-serial');

    if (weightDisplay) {
      weightDisplay.textContent = this.currentWeight.toLocaleString('id-ID');
    }

    if (card && statusTitle && statusDesc) {
      card.classList.remove('connected', 'simulating');

      if (this.isSimulating) {
        card.classList.add('simulating');
        statusTitle.textContent = 'Simulasi Timbangan Aktif';
        statusDesc.textContent = `Mode Virtual Testing (${this.isStable ? 'STABIL' : 'GERAK'})`;
        if (simBtn) simBtn.classList.replace('btn-secondary', 'btn-accent');
      } else if (this.isConnected) {
        card.classList.add('connected');
        statusTitle.textContent = 'Timbangan Terhubung (Serial)';
        statusDesc.textContent = `Online RS232/USB Port (${this.isStable ? 'STABIL' : 'GERAK'})`;
        if (simBtn) simBtn.classList.replace('btn-accent', 'btn-secondary');
      } else {
        statusTitle.textContent = 'Timbangan Terputus';
        statusDesc.textContent = 'Menunggu koneksi Serial USB/RS232';
        if (simBtn) simBtn.classList.replace('btn-accent', 'btn-secondary');
      }
    }

    if (serialBtn) {
      serialBtn.textContent = this.isConnected ? 'Putuskan Serial' : 'Hubungkan Serial (USB/RS232)';
      if (this.isConnected) {
        serialBtn.classList.replace('btn-primary', 'btn-danger');
      } else {
        serialBtn.classList.replace('btn-danger', 'btn-primary');
      }
    }
  }
};
