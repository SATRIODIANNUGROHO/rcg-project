/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Serial Communication & Indicator Bridge (Web Serial API & Hardware Integration)
 * Supports Yaohua (A12E/A9), CAS (CI-series), Toledo, and Generic ASCII Industrial Scales.
 */

const ScaleEngine = {
  currentWeight: 0,
  isStable: true,
  isConnected: false,
  isSimulating: false,
  activePort: null,
  activePortName: '',
  activeBaudRate: 9600,
  activeProtocol: 'auto',
  portReader: null,
  subscribers: [],
  simInterval: null,
  simBaseWeight: 0,
  simJitter: 0,
  lastRawData: '',
  onRawDataCallback: null,

  init() {
    this.updateUI();

    // Hotplug port monitoring in Electron
    if (window.electronAPI && typeof window.electronAPI.onSerialPortAdded === 'function') {
      window.electronAPI.onSerialPortAdded(() => {
        this.refreshPortListUI();
      });
      window.electronAPI.onSerialPortRemoved(() => {
        this.refreshPortListUI();
      });
    }
  },

  // Subscribe to weight and status changes
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

  // =========================================================================
  // HARDWARE PORT DISCOVERY & UI POPULATION
  // =========================================================================

  /**
   * Scans system for available serial ports (Electron IPC or Web Serial getPorts)
   */
  async getAvailablePorts() {
    // 1. Electron Native Port Discovery
    if (window.electronAPI && typeof window.electronAPI.getSystemSerialPorts === 'function') {
      try {
        const ports = await window.electronAPI.getSystemSerialPorts();
        if (Array.isArray(ports) && ports.length > 0) {
          return ports;
        }
      } catch (e) {
        console.warn('Electron getSystemSerialPorts failed:', e);
      }
    }

    // 2. Web Serial API Previously Granted Ports
    if ('serial' in navigator && typeof navigator.serial.getPorts === 'function') {
      try {
        const grantedPorts = await navigator.serial.getPorts();
        if (grantedPorts && grantedPorts.length > 0) {
          return grantedPorts.map((p, idx) => {
            const info = (typeof p.getInfo === 'function') ? p.getInfo() : {};
            const vId = info.usbVendorId ? info.usbVendorId.toString(16) : '';
            const pId = info.usbProductId ? info.usbProductId.toString(16) : '';
            return {
              portName: `Port Serial ${idx + 1}`,
              displayName: `Port Serial USB ${vId ? `(VID:${vId} PID:${pId})` : ''}`
            };
          });
        }
      } catch (e) {
        console.warn('Web Serial getPorts failed:', e);
      }
    }

    return [];
  },

  /**
   * Refreshes the port selection dropdown and status text inside #modal-serial-connect
   */
  async refreshPortListUI() {
    const select = document.getElementById('serial-port-select');
    const statusText = document.getElementById('serial-port-status-text');
    const banner = document.getElementById('serial-port-status-banner');

    if (statusText) statusText.textContent = 'Memindai ketersediaan Port COM...';

    const ports = await this.getAvailablePorts();

    if (select) {
      select.innerHTML = '<option value="">-- Deteksi Otomatis / Pemilih Browser --</option>';

      if (ports.length > 0) {
        ports.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.portName;
          opt.textContent = `${p.displayName || p.portName}`;
          select.appendChild(opt);
        });
        select.value = ports[0].portName;
      }
    }

    if (statusText && banner) {
      if (ports.length > 0) {
        statusText.innerHTML = `<span style="color: var(--success); font-weight: 700;">Terdeteksi ${ports.length} Port COM aktif:</span> ${ports.map(p => p.portName).join(', ')}`;
        banner.style.borderColor = 'var(--success)';
      } else {
        statusText.innerHTML = '<span style="color: var(--accent-gold); font-weight: 600;">Belum ada Port COM fisik terdeteksi.</span> Colokkan kabel USB-to-RS232 indikator ke PC.';
        banner.style.borderColor = 'var(--border-color)';
      }
    }
  },

  // =========================================================================
  // HARDWARE SERIAL COMMUNICATION (Web Serial API & Serial Streams)
  // =========================================================================

  /**
   * Initiates real serial connection to weighing indicator hardware
   */
  async connectSerial(baudRate = 9600, targetPortName = '', protocol = 'auto') {
    if (!('serial' in navigator)) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Browser atau sistem ini tidak mendukung Web Serial API. Pastikan menggunakan Chrome/Edge atau aplikasi Desktop RCG.', 'warning');
      }
      return false;
    }

    const baud = parseInt(baudRate, 10) || 9600;
    this.activeBaudRate = baud;
    this.activeProtocol = protocol || 'auto';

    // Route target port selection in Electron if specific port chosen
    if (targetPortName && window.electronAPI && typeof window.electronAPI.setTargetSerialPort === 'function') {
      try {
        await window.electronAPI.setTargetSerialPort(targetPortName);
      } catch (e) {
        console.warn('setTargetSerialPort warning:', e);
      }
    }

    try {
      // Prompt user or Electron session for hardware serial port
      this.activePort = await navigator.serial.requestPort();

      // Open serial port with standard industrial scale parameters (8-N-1)
      await this.activePort.open({
        baudRate: baud,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 255
      });

      this.isConnected = true;
      this.isSimulating = false;
      this.stopSimulation();
      this.activePortName = targetPortName || 'COM Serial';

      // Start asynchronous read loop
      this.readSerialStream();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Timbangan Serial Terhubung! (${this.activePortName} - ${baud} bps)`, 'success');
      }

      if (typeof StorageManager !== 'undefined' && typeof AuthManager !== 'undefined') {
        const user = AuthManager.getCurrentUser() || { username: 'System', role: 'Operator' };
        StorageManager.addLog(user.username, user.role, `Koneksi Timbangan Serial Terhubung (${this.activePortName} @ ${baud} bps)`, '-');
      }

      this.notifySubscribers();
      return true;
    } catch (err) {
      console.warn('Serial connect cancelled or failed:', err);

      if (err.name === 'NotFoundError') {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Tidak ada Port COM yang dipilih atau koneksi dibatalkan. Pastikan indikator timbangan telah terhubung melalui kabel USB Serial.', 'warning');
        }
      } else if (err.name === 'InvalidStateError' || (err.message && err.message.includes('already open'))) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Port serial sudah terbuka atau sedang diakses oleh proses lain.', 'danger');
        }
      } else {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Gagal membuka koneksi serial: ${err.message || err.name}`, 'danger');
        }
      }

      this.isConnected = false;
      this.notifySubscribers();
      return false;
    }
  },

  /**
   * Disconnects active hardware serial connection
   */
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
      this.currentWeight = 0;
      this.isStable = true;

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Koneksi Timbangan Serial Berhasil Diputuskan', 'info');
      }

      if (typeof StorageManager !== 'undefined' && typeof AuthManager !== 'undefined') {
        const user = AuthManager.getCurrentUser() || { username: 'System', role: 'Operator' };
        StorageManager.addLog(user.username, user.role, 'Koneksi Timbangan Serial Diputuskan', '-');
      }

      this.notifySubscribers();
    } catch (e) {
      console.error('Disconnect error:', e);
      this.isConnected = false;
      this.notifySubscribers();
    }
  },

  /**
   * Handles spontaneous hardware disconnect (e.g. cable pulled or USB unplugged)
   */
  handleHardwareDisconnect(reason = 'Kabel timbangan terputus') {
    if (!this.isConnected) return;
    this.isConnected = false;
    this.activePort = null;
    this.portReader = null;
    this.currentWeight = 0;
    this.isStable = false;

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Perhatian: ${reason}. Koneksi indikator serial terputus.`, 'danger');
    }

    this.notifySubscribers();
  },

  /**
   * Continuous stream reader reading chunked ASCII data from indicator
   */
  async readSerialStream() {
    if (!this.activePort || !this.activePort.readable) return;

    let textDecoder = new TextDecoder();
    let reader = null;

    try {
      reader = this.activePort.readable.getReader();
      this.portReader = reader;
      let buffer = '';

      while (this.isConnected) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = textDecoder.decode(value, { stream: true });
          buffer += chunk;

          // Split incoming stream on any return character (\r, \n, or \r\n)
          // Yaohua and Toledo indicators typically terminate with \r (0x0D)
          // CAS indicators terminate with \r\n
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop() || ''; // Keep trailing incomplete token in buffer

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine) {
              this.parseScaleData(cleanLine, this.activeProtocol);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Serial stream read error or closed:', error);
      this.handleHardwareDisconnect('Kabel USB Serial terlepas atau perangkat tidak merespons');
    } finally {
      if (reader) {
        try {
          reader.releaseLock();
        } catch (e) {
          // Ignore lock release error on closed port
        }
      }
    }
  },

  /**
   * Industrial Weighing Indicator Parser Engine
   * Interprets Yaohua, CAS, Toledo, and Generic ASCII continuous weight frames
   */
  parseScaleData(rawString, protocol = 'auto') {
    if (!rawString) return;
    const trimmed = rawString.trim();
    if (!trimmed) return;

    this.lastRawData = trimmed;

    // Update real-time debug monitor inside modal if open
    const streamDisplay = document.getElementById('serial-raw-stream-display');
    const streamStatusTag = document.getElementById('serial-stream-status-tag');
    if (streamDisplay) {
      streamDisplay.textContent = trimmed;
    }
    if (streamStatusTag) {
      streamStatusTag.textContent = 'Menerima data aktif...';
      streamStatusTag.style.color = 'var(--success)';
    }

    let parsedWeight = null;
    let isStable = true;

    // Stability detection across standard indicators (US = Unstable, ST = Stable)
    if (trimmed.includes('US') || trimmed.includes('OL') || trimmed.includes('?') || trimmed.includes('MO')) {
      isStable = false;
    } else if (trimmed.includes('ST') || trimmed.includes('GS') || trimmed.includes('NT')) {
      isStable = true;
    }

    // 1. Yaohua Format (XK3190-A12E / A9 / A12 / D10)
    // Continuous mode format often sends '=' followed by 6 digits least-significant first
    // Example: "=005610" translates to "016500" -> 16500 Kg
    const yaohuaRevMatch = trimmed.match(/=\s*([0-9]{6})/);
    if (yaohuaRevMatch) {
      const reversed = yaohuaRevMatch[1].split('').reverse().join('');
      const val = parseInt(reversed, 10);
      if (!isNaN(val)) {
        parsedWeight = val;
      }
    }

    // 2. CAS Format (CI-1560A, CI-2001A, CI-501A)
    // Example: "ST,GS,+016500kg" or "US,GS,+016480kg"
    if (parsedWeight === null) {
      const casMatch = trimmed.match(/(?:ST|US|OL)\s*,\s*(?:GS|NT)\s*,\s*([+-]?\s*\d+(?:\.\d+)?)/i);
      if (casMatch) {
        const cleanVal = parseFloat(casMatch[1].replace(/\s+/g, ''));
        if (!isNaN(cleanVal)) {
          parsedWeight = Math.round(cleanVal);
        }
      }
    }

    // 3. Generic Industrial ASCII Frame (e.g. "+ 16500 kg", "16500", "W: 16500.00")
    if (parsedWeight === null) {
      const generalMatch = trimmed.match(/([+-]?\s*\d+(?:[\.,]\d+)?)/);
      if (generalMatch) {
        const cleanVal = parseFloat(generalMatch[0].replace(/\s+/g, '').replace(',', '.'));
        if (!isNaN(cleanVal)) {
          parsedWeight = Math.round(cleanVal);
        }
      }
    }

    if (parsedWeight !== null && !isNaN(parsedWeight)) {
      this.currentWeight = Math.max(0, parsedWeight);
      this.isStable = isStable;
      this.notifySubscribers();
    }
  },

  /**
   * Injects test indicator frame for developer/operator verification
   */
  injectTestData(rawString) {
    this.parseScaleData(rawString, this.activeProtocol);
  },

  // =========================================================================
  // VIRTUAL SCALE SIMULATOR ENGINE (Zero Hardware Training & Demo Mode)
  // =========================================================================

  toggleSimulation() {
    if (this.isSimulating) {
      this.stopSimulation();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Mode Simulasi Timbangan Dinonaktifkan', 'info');
      }
    } else {
      if (this.isConnected) this.disconnectSerial();
      this.startSimulation();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Mode Simulasi Timbangan Aktif', 'warning');
      }
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
    this.simBaseWeight = Math.max(0, parseInt(weightKg, 10) || 0);
    this.currentWeight = this.simBaseWeight;
    this.notifySubscribers();
  },

  // =========================================================================
  // UI STATUS CARD RENDERING
  // =========================================================================

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
        statusTitle.textContent = 'Timbangan Terhubung (Serial Online)';
        statusDesc.textContent = `${this.activePortName || 'Port COM'} @ ${this.activeBaudRate} bps (${this.isStable ? 'STABIL' : 'GERAK'})`;
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
