# PT. Reka Cipta Garam - Salt Weighing System (Sistem Jembatan Timbang)

Sistem Informasi Penimbangan Truk Garam Industri modern berbasis **Electron Desktop & Web Application** untuk **PT. Reka Cipta Garam**.

Aplikasi ini dirancang khusus untuk mempermudah operator dan manajemen dalam mencatat, menimbang, menghitung refraksi & kualitas garam (K1/K2), mencetak nota tiket timbang, serta memantau analitik tonase secara *real-time*.

---

## Fitur Utama

- **Penimbangan Truk Otomatis & Simulator**:
  - Koneksi langsung ke indikator timbangan jembatan truk via **RS-232 / USB Serial (Web Serial API)**.
  - Panel **Simulator Timbangan Interaktif** untuk pengujian dan pelatihan operator.
- **Perhitungan Kualitas Garam & Refraksi Otomatis**:
  - Perhitungan Berat Muatan (Gross - Tara).
  - Potongan Refraksi (%) dan pembagian mutu Garam Kualitas 1 (K1) & Kualitas 2 (K2).
  - Kalkulasi nilai pembayaran rupiah otomatis.
- **Cetak Nota & Tiket Timbang**:
  - Format cetak nota standar industri lengkap dengan kop perusahaan, rincian muatan, dan tanda tangan operator.
- **Dashboard & Statistik Interaktif**:
  - Grafik tonase harian/mingguan, distribusi supplier Madura terbesar, rasio K1 vs K2, dan perputaran armada.
- **Manajemen Pengguna & Profil Akun**:
  - Role-based Access Control: **Administrator** & **Operator**.
  - Manajemen Foto Profil, Avatar Kustom, dan Ganti Password.
- **Backup, Restore, & Auto-Backup**:
  - Fitur backup otomatis berkala setiap 15 menit.
  - Export & Import data JSON (kompatibel dengan file arsip cadangan versi sebelumnya).
  - Export rekap laporan ke format Excel spreadsheet.
- **Desain Korporat Industri (Mode Terang & Gelap)**:
  - Antarmuka bertema industri modern dengan tipografi *Plus Jakarta Sans*, kalender kustom, dan dukungan Dark Mode.

---

## Akun Masuk Bawaan (Default Login)

| Username | Password | Hak Akses (Role) | Keterangan |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Administrator** | Akses penuh (Dashboard, Input Timbang, Riwayat, Activity Log, Reset/Backup) |
| **`operator`** | `operator123` | **Operator** | Akses operasional harian (Input Penimbangan, Cetak Nota, Riwayat) |

---

## Cara Menjalankan Aplikasi

### Cara 1: Menjalankan Langsung (Paling Praktis)
1. Buka folder proyek ini.
2. Klik ganda (*double click*) file:
   - **`run-app.bat`**
3. Aplikasi desktop akan langsung terbuka dan siap digunakan.

---

### Cara 2: Menjalankan via Terminal
Pastikan komputer sudah terinstal **Node.js** (versi 18 ke atas), lalu jalankan:
```bash
# 1. Pasang dependensi (hanya saat pertama kali)
npm install

# 2. Jalankan aplikasi
npm start
```

---

## Cara Membuat File Installer (.EXE)

Untuk mengompilasi aplikasi menjadi file instalasi mandiri (*Standalone Installer & Portable .exe*):

1. Klik ganda file:
   - **`build-exe.bat`**
   *(atau jalankan perintah `npm run dist` di terminal)*
2. Tunggu proses pembuatan hingga selesai.
3. File `.exe` siap pakai akan otomatis tersedia di dalam folder **`dist/`**:
   - **`dist/RCG Salt Weighing System Setup 7.5.0.exe`** (*Installer Windows*)
   - **`dist/RCG Salt Weighing System 7.5.0.exe`** (*Versi Portable langsung klik jalan*)

---

## Struktur Direktori

```text
RCG/
├── assets/
│   ├── css/
│   │   ├── style.css             # Tema utama, tata letak, & komponen
│   │   ├── dark-mode.css         # Skema warna mode gelap
│   │   └── print-nota.css        # Format cetak tiket struk timbangan
│   ├── icons/
│   │   ├── icon.ico              # Ikon Windows Executable resmi (.exe)
│   │   └── icon.png              # Ikon taskbar resolusi tinggi
│   ├── images/
│   │   └── RCG.webp              # Logo resmi PT. Reka Cipta Garam
│   └── js/
│       ├── storage.js            # Penyimpanan basis data & export/import
│       ├── auth.js               # Manajemen otentikasi & profil user
│       ├── serial-scale.js       # Driver pembacaan timbangan serial RS232
│       ├── custom-select.js      # Komponen dropdown kustom
│       ├── custom-datepicker.js  # Komponen kalender pemilih tanggal
│       ├── custom-autocomplete.js# Komponen pencarian/autocomplete pemasok
│       ├── transaction.js        # Logika input penimbangan garam
│       ├── history.js            # Pencarian, filter & paginasi data
│       ├── analytics.js          # Grafik performa & statistik Chart.js
│       └── app.js                # Pengendali utama alur aplikasi
├── scripts/
│   └── generate-icons.js         # Generator otomatis ikon multi-resolusi
├── index.html                    # Halaman Dashboard & Operasional Utama
├── login.html                    # Halaman Masuk Aplikasi
├── main.js                       # Electron Desktop Main Process
├── preload.js                    # Electron Preload Bridge
├── package.json                  # Konfigurasi proyek & skrip build
├── run-app.bat                   # Jalan pintas menjalankan aplikasi
└── build-exe.bat                 # Jalan pintas mem-build file .exe
```

---

## Teknologi yang Digunakan

- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **Core Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 Variables
- **Hardware Integration**: Web Serial API (RS232 / USB Serial Converter)
- **Charts & Visualization**: [Chart.js](https://www.chartjs.org/)
- **Icon Assets**: FontAwesome Classic Solid SVG Vectors
- **Build System**: `electron-builder` & `sharp`

---

## Hak Cipta & Lisensi

&copy; 2026 **PT. Reka Cipta Garam**. *All Rights Reserved.*
Dikembangkan untuk operasional jembatan timbang terintegrasi kawasan industri garam Madura.
