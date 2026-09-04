# PT. Reka Cipta Garam - Salt Weighing System v8.0 (Sistem Jembatan Timbang)

Sistem Informasi Penimbangan Truk Garam Industri modern berbasis **Electron Desktop & Web Application** untuk **PT. Reka Cipta Garam**.

Aplikasi ini dirancang khusus untuk mempermudah operator, supervisor, dan manajemen dalam mencatat transaksi penimbangan, integrasi timbangan serial RS-232, menghitung refraksi & kualitas mutu garam (**Garam K1** & **Garam K2**), mencetak nota tiket timbang & formulir supplier (PDF/Printer), rekapitulasi riwayat pemasok, serta analitik tonase interaktif secara *real-time* berbasis **Basis Data Relasional SQLite 3**.

---

## Daftar Isi
1. [Fitur Utama v8.0](#fitur-utama-v80)
2. [Akun Masuk Bawaan & Matriks Hak Akses (RBAC)](#akun-masuk-bawaan--matriks-hak-akses-rbac)
3. [Arsitektur Basis Data SQLite 3](#arsitektur-basis-data-sqlite-3)
4. [Formula Perhitungan Mutu Garam & Refraksi](#formula-perhitungan-mutu-garam--refraksi)
5. [Spesifikasi Format Cetak & Ekspor Dokumen](#spesifikasi-format-cetak--ekspor-dokumen)
6. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
7. [Cara Membuat File Installer (.EXE)](#cara-membuat-file-installer-exe)
8. [Struktur Direktori](#struktur-direktori)
9. [Hak Cipta & Lisensi](#hak-cipta--lisensi)

---

## Fitur Utama v8.0

- **Basis Data Relasional SQLite Engine (SQLite3 via `sql.js` WebAssembly)**:
  - Penyimpanan data transaksi, akun pengguna, log aktivitas audit, dan pengaturan aplikasi menggunakan format basis data relasional standar **SQLite 3** (`data/rcg_database.sqlite`).
  - Dilengkapi indeks sekunder performa tinggi (*instant latency*): `idx_tx_date`, `idx_tx_supplier`, `idx_tx_docno`, `idx_logs_time`.
  - Fitur **Unduh Basis Data (.sqlite)** dan **Impor Database SQLite** untuk pencadangan tingkat lanjut dan portabilitas enterprise.
  - Berkas database `.sqlite` dapat dibuka dan dianalisis secara langsung menggunakan aplikasi standar industri seperti *DB Browser for SQLite*, *DBeaver*, atau *TablePlus*.
  - Mekanisme **Auto-Migration** cerdas yang mengonversi data lama dari `localStorage` secara otomatis tanpa kehilangan data (*zero data loss*).
  - Metode diagnostik dan *direct query* interaktif via console: `StorageManager.getEngineInfo()` dan `StorageManager.query(sql)`.

- **Penimbangan Truk Otomatis & Simulator Hardware**:
  - Koneksi langsung ke indikator jembatan timbang truk via **RS-232 / USB Serial (Web Serial API)**.
  - Panel **Simulator Timbangan Interaktif** dengan slider bobot, tombol cepat, dan mode acak untuk pelatihan operator.
  - Deteksi kestabilan timbangan (*auto-hold stable reading*).

- **Perhitungan Kualitas Mutu Garam & Refraksi Otomatis**:
  - Perhitungan Berat Muatan / Netto Kotor ($Gross - Tare$).
  - Potongan Refraksi (%) dan pembagian tonase mutu **Garam K1** & **Garam K2**.
  - Kalkulasi nilai pembayaran rupiah otomatis berdasarkan harga acuan per Kg kustom (`priceK1`, `priceK2`).
  - Master data asal garam pesisir Madura (Bangkalan, Sampang, Pamekasan, Sumenep).

- **Cetak Nota Timbang & Form Supplier (PDF & Printer)**:
  - Pratinjau interaktif (*live paper preview*) sebelum mencetak.
  - Pilihan ukuran kertas: **A6** (standar tiket), **A5**, **A4**, **Letter**, dan **NCR Wartel 9.5" × 11"**.
  - Pilihan rangkap/salinan (1x Asli, 2x Rangkap, 3x Arsip) dan area tanda tangan (*Supir & Petugas Timbang*).
  - Ekspor PDF vektor bersih (*zero-border & zero-margin*) dengan logo resmi tersemat instan.
  - Tata letak header/kop nota dan formulir pemasok yang rapi, presisi, dan seragam.

- **Riwayat Transaksi & Riwayat Pemasok/Supplier**:
  - Menu **Riwayat Penimbangan** dengan pencarian realtime (No Dokumen, Pemasok, No Polisi, Supir), filter rentang tanggal, dan tombol aksi (*Detail, Edit Transaksi, Cetak Ulang, Hapus*).
  - Menu **Riwayat Pemasok** untuk memantau rekap tonase bersih per supplier, total rupiah pembayaran, filter periode, dan tombol cetak **Formulir Rekapitulasi Pemasok**.

- **Dashboard & Analitik Visual Terpadu**:
  - Kartu Ringkasan: *Berat Bersih Periode, Pembayaran Periode, Rata-rata Tonase, & Total Transaksi*.
  - Grafik Transaksi per Minggu (Minggu 1 mulai 26 Juli 2026).
  - Pie Chart Komposisi Mutu Garam (*Garam K1 vs Garam K2*).
  - **Double Donut Chart**: Sebaran Asal Garam (Cincin Dalam: Kabupaten; Cincin Luar: Desa Pesisir).

- **Hak Akses & Manajemen Pengguna (RBAC Granular)**:
  - Panel manajemen pengguna 2-kolom dengan matriks hak akses (*Lihat, Tambah, Ubah, Hapus* per modul).
  - Otoritas khusus sistem: Cetak ulang tiket, pengaturan sistem, kelola hak akses, backup/reset database.
  - Fitur Tambah Akun Baru, Ubah Password, & Hapus Pengguna dengan validasi keamanan.

- **Ekspor Excel Presisi Tinggi (`.xlsx`)**:
  - Didukung engine **ExcelJS**, menghasilkan spreadsheet buku besar berstandar akuntansi PT. Reka Cipta Garam.
  - Header **Navy Blue (`#0F4C81`)** dengan teks putih tebal dan **AutoFilter** aktif.
  - Format angka desimal ribuan mata uang Rupiah (`Rp #,##0`) dan Tonase (`#,##0 Kg`).
  - Baris **TOTAL Pale Gold (`#FFF2CC`)** dengan formula otomatis **AutoSum** `=SUM()`.

- **Backup, Restore, & Audit Trail Activity Log**:
  - Dukungan ganda: Berkas biner database **SQLite (.sqlite)** dan file cadangan **JSON (.json)**.
  - Backup otomatis lokal berkala (*auto-backup slot*).
  - Activity Log mendetail dengan pencatatan alasan wajib pada setiap proses penghapusan/reset data transaksi.

- **Standar Desain Resmi ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md))**:
  - Mode Gelap & Mode Terang dengan tipografi modern **Plus Jakarta Sans**, ikon SVG bersih (Zero Emojis), dan palet warna industrial profesional.

- **100% Offline Lokal (Tanpa Dependensi Internet)**:
  - Seluruh modul pustaka (*sql.js WASM, Chart.js, ExcelJS, SheetJS XLSX, html2pdf.js*) berjalan secara mandiri dan offline di komputer pengguna.

---

## Akun Masuk Bawaan & Matriks Hak Akses (RBAC)

Aplikasi dilengkapi 3 role pengguna bawaan dengan matriks kewenangan hak akses terperinci:

| Username | Password | Hak Akses (Role) | Deskripsi Kewenangan |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Administrator** | Akses penuh (Dashboard, Input Timbang, Riwayat, Activity Log, Hak Akses, Pengaturan, Backup/Reset) |
| **`operator`** | `operator123` | **Operator** | Akses operasional harian (Input Penimbangan, Cetak Tiket Nota, Lihat Riwayat Transaksi) |
| **`supervisor`** | `supervisor123` | **Supervisor** | Akses pengawas & audit (Read-Only: Dashboard Analitik, Riwayat Transaksi, Riwayat Pemasok, Cetak Form) |

### Matriks Kewenangan Sistem (Default Role Matrix)

| Modul / Tindakan | Administrator | Operator | Supervisor |
| :--- | :---: | :---: | :---: |
| **Data Pemasok** (*Lihat / Tambah / Ubah / Hapus*) | ✔ / ✔ / ✔ / ✔ | ✔ / ✔ / ✔ / ✖ | ✔ / ✖ / ✖ / ✖ |
| **Data Material** (*Lihat / Tambah / Ubah / Hapus*) | ✔ / ✔ / ✔ / ✔ | ✔ / ✖ / ✖ / ✖ | ✔ / ✖ / ✖ / ✖ |
| **Transaksi Timbang** (*Lihat / Tambah / Ubah / Hapus*) | ✔ / ✔ / ✔ / ✔ | ✔ / ✔ / ✔ / ✖ | ✔ / ✖ / ✖ / ✖ |
| **Laporan & Analitik** (*Lihat / Ekspor*) | ✔ / ✔ | ✔ / ✔ | ✔ / ✔ |
| **Cetak Ulang Nota** | ✔ | ✔ | ✔ |
| **Ubah Pengaturan Sistem & Harga** | ✔ | ✖ | ✖ |
| **Kelola Pengguna & Matriks Hak Akses** | ✔ | ✖ | ✖ |
| **Backup & Reset Basis Data** | ✔ | ✖ | ✖ |

---

## Arsitektur Basis Data SQLite 3

Sistem menggunakan mesin basis data relasional **SQLite 3** berbasis WebAssembly (`sql.js`) dengan penyimpanan file fisik di `data/rcg_database.sqlite`.

### Skema Tabel Relasional

1. **`transactions`** (Data Penimbangan):
   - `id` (PK, TEXT), `doc_no` (UNIQUE, TEXT), `date` (TEXT), `time_in` (TEXT), `time_out` (TEXT), `plate_no` (TEXT), `supplier` (TEXT), `material` (TEXT), `bag_count` (INTEGER), `origin_region` (TEXT), `origin_area` (TEXT), `scale_type` (TEXT), `gross_weight` (REAL), `tare_weight` (REAL), `net_load_weight` (REAL), `refraction_percent` (REAL), `refraction_kg` (REAL), `final_net_weight` (REAL), `k1_weight` (REAL), `k2_weight` (REAL), `k1_price` (REAL), `k2_price` (REAL), `k1_total` (REAL), `k2_total` (REAL), `grand_total` (REAL), `status` (TEXT), `driver` (TEXT), `weighmaster` (TEXT), `created_at` (TEXT), `updated_at` (TEXT).
   - **Indeks**: `idx_tx_date` (pencarian periode tanggal), `idx_tx_supplier` (rekapitulasi pemasok), `idx_tx_docno` (pencarian nomor tiket).

2. **`users`** (Akun Pengguna & Kewenangan):
   - `id` (PK, TEXT), `username` (UNIQUE, TEXT), `password` (TEXT), `role` (TEXT), `display_name` (TEXT), `created_at` (TEXT).

3. **`activity_logs`** (Log Audit Sistem):
   - `id` (PK, TEXT), `timestamp` (TEXT), `user` (TEXT), `role` (TEXT), `activity` (TEXT), `doc_no` (TEXT), `reason` (TEXT).
   - **Indeks**: `idx_logs_time` (pembacaan log berurutan waktu nyata).

4. **`settings`** (Konfigurasi Global & Preferensi):
   - `key` (PK, TEXT), `value` (TEXT), `updated_at` (TEXT).

---

## Formula Perhitungan Mutu Garam & Refraksi

$$\text{Berat Muatan (Netto Kotor)} = \text{Gross} - \text{Tare}$$

$$\text{Potongan Refraksi (Kg)} = \text{Berat Muatan} \times \left(\frac{\text{Refraksi \%}}{100}\right)$$

$$\text{Berat Bersih Akhir} = \text{Berat Muatan} - \text{Potongan Refraksi (Kg)}$$

$$\text{Total K1 (Rp)} = \text{Berat K1 (Kg)} \times \text{Harga K1}$$

$$\text{Total K2 (Rp)} = \text{Berat K2 (Kg)} \times \text{Harga K2}$$

$$\text{Total Pembayaran (Grand Total)} = \text{Total K1} + \text{Total K2}$$

---

## Spesifikasi Format Cetak & Ekspor Dokumen

- **Nota Tiket Timbangan (Ukuran A6 / A5 / A4 / Letter / NCR Wartel 9.5" × 11")**:
  - Kop resmi PT. Reka Cipta Garam beserta logo resmi.
  - Rincian identitas kendaraan, supir, jam masuk/keluar, dan pemasok.
  - Rincian penimbangan (Gross, Tare, Netto, Refraksi, K1, K2).
  - Nilai pembayaran rupiah dan status pembayaran (**Lunas** / **Belum Lunas**).
  - Kolom tanda tangan resmi (*Supir* & *Petugas Timbang / Admin*).
- **Formulir Pemasok (Ukuran A4 / Letter)**:
  - Rekapitulasi transaksi penerimaan garam per pemasok.
  - Total tonase bersih terkirim dan akumulasi rupiah pembayaran.
- **Ekspor Excel Presisi Tinggi (`.xlsx`)**:
  - Didukung engine ExcelJS berstandar buku besar akuntansi PT. Reka Cipta Garam.

---

## Cara Menjalankan Aplikasi

### Cara 1: Menjalankan Langsung (Desktop App)
1. Buka folder proyek ini.
2. Klik ganda file shortcut:
   - **`run-app.bat`**
3. Aplikasi desktop akan langsung terbuka dan siap digunakan.

---

### Cara 2: Menjalankan via Terminal (Node.js)
Pastikan komputer sudah terinstal **Node.js** (versi 18 ke atas):
```bash
# 1. Pasang dependensi (hanya saat pertama kali)
npm install

# 2. Jalankan aplikasi desktop
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
   - **`dist/RCG Salt Weighing System Setup 8.0.0.exe`** (*Installer Windows NSIS*)
   - **`dist/RCG Salt Weighing System 8.0.0.exe`** (*Versi Standalone Portable*)
   - **`dist/win-unpacked/RCG Salt Weighing System.exe`** (*Versi Unpacked Folder*)

---

## Struktur Direktori

```text
RCG/
├── assets/
│   ├── css/
│   │   ├── style.css             # Tema utama, tata letak, & komponen UI
│   │   ├── dark-mode.css         # Skema warna mode gelap (Design System)
│   │   └── print-nota.css        # Format cetak nota tiket timbangan & form supplier
│   ├── icons/
│   │   ├── icon.ico              # Ikon Windows Executable resmi (.exe)
│   │   └── icon.png              # Ikon resolusi tinggi aplikasi
│   ├── images/
│   │   └── RCG.webp              # Logo resmi PT. Reka Cipta Garam
│   ├── vendor/
│   │   ├── sql-wasm.js           # Mesin SQLite3 WebAssembly Engine (sql.js)
│   │   ├── sql-wasm.wasm         # Modul biner WebAssembly SQLite 3
│   │   ├── chart.umd.min.js      # Pustaka Chart.js lokal (Offline Mode)
│   │   ├── exceljs.min.js        # Pustaka ExcelJS lokal untuk spreadsheet berdesain
│   │   ├── xlsx.full.min.js      # Pustaka SheetJS lokal (Offline Mode)
│   │   └── html2pdf.bundle.min.js# Pustaka konversi PDF lokal (Offline Mode)
│   └── js/
│       ├── storage.js            # SQLite Relational Database Engine & StorageManager
│       ├── auth.js               # Otentikasi, RBAC & manajemen hak akses granular
│       ├── serial-scale.js       # Driver timbangan serial RS232 & simulator
│       ├── custom-select.js      # Dropdown menu kustom dengan smart boundary
│       ├── custom-datepicker.js  # Komponen kalender pemilih tanggal
│       ├── custom-timepicker.js  # Komponen pemilih waktu (WIB) kustom
│       ├── custom-autocomplete.js# Komponen autocomplete daftar pemasok
│       ├── print-dialog.js       # Dialog live preview cetak & ukuran kertas
│       ├── export-excel.js       # Mesin ekspor Excel dengan AutoFilter & AutoSum
│       ├── transaction.js        # Logika input penimbangan & kalkulasi mutu
│       ├── history.js            # Riwayat transaksi penimbangan & aksi data
│       ├── supplier-history.js   # Riwayat pemasok & cetak form supplier
│       ├── analytics.js          # Double Donut Chart & statistik mingguan
│       └── app.js                # Pengendali utama alur & antarmuka aplikasi
├── scripts/
│   ├── generate-icons.js         # Generator otomatis ikon multi-resolusi
│   └── test-sqlite-engine.js     # Skrip verifikasi & uji diagnostik SQLite Engine
├── DESIGN_SYSTEM.md              # Dokumen acuan resmi desain antarmuka RCG
├── index.html                    # Halaman Dashboard & Operasional Utama
├── login.html                    # Halaman Masuk Aplikasi
├── splash.html                   # Splash Screen awal aplikasi
├── main.js                       # Electron Desktop Main Process & IPC Handlers
├── preload.js                    # Electron Preload Bridge
├── package.json                  # Konfigurasi proyek & skrip build
├── run-app.bat                   # Jalan pintas menjalankan aplikasi
└── build-exe.bat                 # Jalan pintas mem-build file .exe
```

---

## Hak Cipta & Lisensi

&copy; 2026 **PT. Reka Cipta Garam**. *All Rights Reserved.*  
Dikembangkan untuk operasional jembatan timbang terintegrasi kawasan industri garam Madura.
