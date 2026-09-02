# PT. Reka Cipta Garam - Salt Weighing System v8.0 (Sistem Jembatan Timbang)

Sistem Informasi Penimbangan Truk Garam Industri modern berbasis **Electron Desktop & Web Application** untuk **PT. Reka Cipta Garam**.

Aplikasi ini dirancang khusus untuk mempermudah operator dan manajemen dalam mencatat transaksi penimbangan, integrasi timbangan serial RS-232, menghitung refraksi & kualitas garam (Garam K1 / Garam K2), mencetak nota tiket timbang & formulir supplier (PDF), rekapitulasi riwayat pemasok, serta analitik tonase interaktif secara *real-time*.

---

## Fitur Utama v8.0

- **Penimbangan Truk Otomatis & Simulator**:
  - Koneksi langsung ke indikator jembatan timbang truk via **RS-232 / USB Serial (Web Serial API)**.
  - Panel **Simulator Timbangan Interaktif** untuk pengujian dan pelatihan operator timbang.
- **Perhitungan Kualitas Garam & Refraksi Otomatis**:
  - Perhitungan Berat Muatan (Gross - Tare).
  - Potongan Refraksi (%) dan pembagian mutu **Garam K1** & **Garam K2**.
  - Kalkulasi nilai pembayaran rupiah otomatis.
- **Cetak Nota Timbang & Form Supplier (PDF & Printer)**:
  - Pratinjau interaktif (*live paper preview*) sebelum mencetak.
  - Pilihan ukuran kertas: **A6** (standar tiket), **A5**, **A4**, **Letter**, dan **NCR Wartel 9.5" × 11"**.
  - Pilihan rangkap/salinan (1x, 2x, 3x) dan area tanda tangan (Supir & Admin).
- **Riwayat Transaksi & Riwayat Pemasok/Supplier**:
  - Menu **Riwayat Penimbangan** dengan pencarian realtime, filter tanggal, dan tombol aksi (*Detail, Edit, Cetak, Hapus*).
  - Menu **Riwayat Pemasok** untuk memantau rekap tonase dan mencetak Formulir Pemasok.
- **Dashboard & Analitik Visual (Double Donut Chart)**:
  - Kartu Ringkasan: *Berat Bersih Periode, Pembayaran Periode, & Ringkasan Analitik*.
  - Grafik Transaksi per Minggu (Minggu 1 mulai 26 Juli 2026).
  - Pie Chart Mutu: *Komposisi Mutu Garam K1 dan Garam K2*.
  - **Double Donut Chart**: Sebaran Asal Garam (Cincin Dalam: Kabupaten; Cincin Luar: Desa).
- **Hak Akses & Manajemen Pengguna (RBAC Granular)**:
  - Panel manajemen pengguna 2-kolom dengan matriks hak akses (*Lihat, Tambah, Ubah, Hapus* per modul).
  - Otoritas khusus sistem: Cetak ulang tiket, pengaturan sistem, kelola hak akses, backup/compact database.
  - Tombol instan *Pilih Semua* dan *Kosongkan Semua*.
- **Ekspor Excel Presisi Tinggi (.xlsx)**:
  - Didukung engine **ExcelJS**, menghasilkan output 100% identik dengan standar buku besar PT. Reka Cipta Garam.
  - Header **Navy Blue (`#0F4C81`)** dengan **AutoFilter** aktif, data baris rapi dengan border halus, serta baris **TOTAL Pale Gold (`#FFF2CC`)** dengan formula otomatis **AutoSum** `=SUM()`.
- **Cetak Nota Timbang & Form Supplier (PDF & Printer)**:
  - Pratinjau interaktif (*live paper preview*) sebelum mencetak.
  - Pilihan ukuran kertas: **A6** (standar tiket), **A5**, **A4**, **Letter**, dan **NCR Wartel 9.5" × 11"**.
  - Pilihan rangkap/salinan (1x, 2x, 3x) dan area tanda tangan (Supir & Admin).
  - Ekspor PDF vektor bersih (*zero-border & zero-margin*) dengan logo resmi tersemat instan.
- **Riwayat Transaksi & Riwayat Pemasok/Supplier**:
  - Menu **Riwayat Penimbangan** dengan pencarian realtime, filter tanggal, dan tombol aksi (*Detail, Edit, Cetak, Hapus*).
  - Menu **Riwayat Pemasok** untuk memantau rekap tonase dan mencetak Formulir Pemasok.
  - Fitur pengeditan atribut dokumen nota langsung dari riwayat transaksi.
- **Dashboard & Analitik Visual (Double Donut Chart)**:
  - Kartu Ringkasan: *Berat Bersih Periode, Pembayaran Periode, & Ringkasan Analitik*.
  - Grafik Transaksi per Minggu (Minggu 1 mulai 26 Juli 2026).
  - Pie Chart Mutu: *Komposisi Mutu Garam K1 dan Garam K2*.
  - **Double Donut Chart**: Sebaran Asal Garam (Cincin Dalam: Kabupaten; Cincin Luar: Desa).
- **Hak Akses & Manajemen Pengguna (RBAC Granular)**:
  - Panel manajemen pengguna 2-kolom dengan matriks hak akses (*Lihat, Tambah, Ubah, Hapus* per modul).
  - Otoritas khusus sistem: Cetak ulang tiket, pengaturan sistem, kelola hak akses, backup/compact database.
  - Tombol aksi minimalis teks (*Tambah User, Ubah Password, Hapus Pengguna*).
- **Backup, Restore, & Audit Log**:
  - Backup otomatis lokal berkala.
  - Export & Import data JSON (kompatibel dengan file arsip cadangan versi sebelumnya).
  - Activity Log mendetail dengan alasan wajib pada setiap proses penghapusan/reset data.
- **Standar Desain Resmi ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md))**:
  - Mode Gelap & Mode Terang dengan tipografi modern **Plus Jakarta Sans**, ikon SVG bersih (Zero Emojis), dan palet warna industrial profesional.
- **100% Offline Lokal (Tanpa Dependensi Internet)**:
  - Semua library (*Chart.js, ExcelJS, SheetJS XLSX, html2pdf.js*) berjalan secara lokal.

---

## Akun Masuk Bawaan (Default Login)

| Username | Password | Hak Akses (Role) | Keterangan |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Administrator** | Akses penuh (Dashboard, Input Timbang, Riwayat, Activity Log, Hak Akses, Backup) |
| **`operator`** | `operator123` | **Operator** | Akses operasional harian (Input Penimbangan, Cetak Nota, Riwayat) |

---

## Cara Menjalankan Aplikasi

### Cara 1: Menjalankan Langsung (Desktop App)
1. Buka folder proyek ini.
2. Klik ganda file:
   - **`run-app.bat`**
3. Aplikasi desktop akan langsung terbuka dan siap digunakan.

---

### Cara 2: Menjalankan via Terminal (Node.js)
Pastikan komputer sudah terinstal **Node.js** (versi 18 ke atas):
```bash
# 1. Pasang dependensi (hanya saat pertama kali)
npm install

# 2. Jalankan aplikasi
npm start
```

---

### Cara 3: Menjalankan via Web Browser (XAMPP / Local Server)
1. Nyalakan modul Apache di **XAMPP Control Panel**.
2. Buka browser (Chrome / Edge), lalu akses:
   ```text
   http://localhost/RCG/
   ```

---

## Cara Membuat File Installer (.EXE)

Untuk mengompilasi aplikasi menjadi installer desktop Windows mandiri:

1. Klik ganda file:
   - **`build-exe.bat`**
   *(atau jalankan perintah `npm run dist` di terminal)*
2. File hasil build akan tersedia di folder **`dist/`**:
   - **`dist/RCG Salt Weighing System Setup 8.0.0.exe`** (*Installer Windows*)
   - **`dist/RCG Salt Weighing System 8.0.0.exe`** (*Versi Portable*)
   - **`dist/win-unpacked/RCG Salt Weighing System.exe`** (*Versi Unpacked*)

---

## Struktur Direktori

```text
RCG/
├── assets/
│   ├── css/
│   │   ├── style.css             # Tema utama, tata letak, & komponen
│   │   ├── dark-mode.css         # Skema warna mode gelap (Design System)
│   │   └── print-nota.css        # Format cetak nota tiket timbangan & form supplier
│   ├── icons/
│   │   ├── icon.ico              # Ikon Windows Executable resmi (.exe)
│   │   └── icon.png              # Ikon resolusi tinggi
│   ├── images/
│   │   └── RCG.webp              # Logo resmi PT. Reka Cipta Garam
│   ├── vendor/
│   │   ├── chart.umd.min.js      # Pustaka Chart.js lokal (Offline Mode)
│   │   ├── exceljs.min.js        # Pustaka ExcelJS lokal untuk spreadsheet berdesain
│   │   ├── xlsx.full.min.js      # Pustaka SheetJS lokal (Offline Mode)
│   │   └── html2pdf.bundle.min.js# Pustaka konversi PDF lokal (Offline Mode)
│   └── js/
│       ├── storage.js            # Basis data & activity log audit
│       ├── auth.js               # Otentikasi, RBAC & manajemen hak akses
│       ├── serial-scale.js       # Driver timbangan serial RS232 & simulator
│       ├── custom-select.js      # Dropdown menu kustom dengan smart boundary
│       ├── custom-datepicker.js  # Komponen kalender pemilih tanggal
│       ├── custom-timepicker.js  # Komponen pemilih waktu (WIB) kustom
│       ├── custom-autocomplete.js# Komponen autocomplete daftar pemasok
│       ├── print-dialog.js       # Dialog live preview cetak & ukuran kertas
│       ├── export-excel.js       # Mesin ekspor Excel dengan AutoFilter & AutoSum
│       ├── transaction.js        # Logika input penimbangan & kalkulasi mutu
│       ├── history.js            # Riwayat transaksi penimbangan
│       ├── supplier-history.js   # Riwayat pemasok & cetak form supplier
│       ├── analytics.js          # Double Donut Chart & statistik mingguan
│       └── app.js                # Pengendali utama alur aplikasi
├── scripts/
│   └── generate-icons.js         # Generator otomatis ikon multi-resolusi
├── DESIGN_SYSTEM.md              # Dokumen acuan resmi desain antarmuka RCG
├── index.html                    # Halaman Dashboard & Operasional Utama
├── login.html                    # Halaman Masuk Aplikasi
├── splash.html                   # Splash Screen awal aplikasi
├── main.js                       # Electron Desktop Main Process
├── preload.js                    # Electron Preload Bridge
├── package.json                  # Konfigurasi proyek & skrip build
├── run-app.bat                   # Jalan pintas menjalankan aplikasi
└── build-exe.bat                 # Jalan pintas mem-build file .exe
```

---

## Hak Cipta & Lisensi

&copy; 2026 **PT. Reka Cipta Garam**. *All Rights Reserved.*
Dikembangkan untuk operasional jembatan timbang terintegrasi kawasan industri garam Madura.
