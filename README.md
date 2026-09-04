# PT. Reka Cipta Garam - Salt Weighing System v8.0

Sistem Informasi Penimbangan Truk Garam Industri modern berbasis **Electron Desktop & Web Application** untuk **PT. Reka Cipta Garam**.

Aplikasi ini dirancang khusus untuk mempermudah operasional harian, operator timbang, dan manajemen dalam mencatat transaksi penimbangan kendaraan truk garam, integrasi langsung dengan indikator jembatan timbang serial RS-232, kalkulasi refraksi otomatis dan pembagian mutu garam (Garam K1 & Garam K2), penerbitan tiket timbang & formulir pemasok (PDF vektor), rekapitulasi riwayat supplier, analitik tonase interaktif, serta manajemen basis data relasional SQLite.

---

## Daftar Fitur Lengkap Sistem (v8.0)

### 1. Basis Data Relasional SQLite Engine (SQLite 3 via sql.js WebAssembly)
- **Format Database Standar Industri**: Penyimpanan data transaksi penimbangan, akun pengguna, audit log aktivitas, dan pengaturan sistem menggunakan format basis data relasional standar **SQLite 3** murni (`data/rcg_database.sqlite`).
- **Skema Tabel Relasional**:
  - `transactions`: Menyimpan data transaksi lengkap (ID, No Dokumen, Tanggal, Jam Masuk/Keluar, Nama Pemasok, No Polisi Truk, Jenis Material, Asal Daerah/Kabupaten/Desa, Berat Kotor, Berat Tara, Berat Muatan, Refraksi, Berat Bersih, Mutu K1, Mutu K2, Harga, Subtotal, Grand Total, Status Pembayaran, Nama Supir, Nama Petugas Timbang/Admin).
  - `users`: Menyimpan kredensial pengguna, peran (Role), serta izin granular modular (RBAC).
  - `activity_logs`: Menyimpan jejak audit sistem (timestamp, username, role, aksi, no dokumen, dan alasan/keterangan).
  - `app_settings`: Menyimpan konfigurasi jembatan timbang, printer, toleransi, dan parameter perusahaan.
- **Indeks Performa Tinggi**: Dilengkapi indeks sekunder untuk pencarian dan pemfilteran instan tanpa latensi (`idx_tx_date`, `idx_tx_supplier`, `idx_tx_docno`, `idx_logs_time`).
- **Unduh Basis Data (.sqlite)**: Fitur ekspor biner database SQLite murni yang dapat dibuka langsung melalui perangkat lunak manajemen basis data seperti DB Browser for SQLite, DBeaver, atau TablePlus.
- **Impor Basis Data (.sqlite)**: Fitur pemulihan dan migrasi basis data SQLite secara langsung dari berkas biner `.sqlite`.
- **Auto-Migration Cerdas**: Mekanisme migrasi otomatis yang mengonversi data legacy dari format JSON / localStorage ke tabel relasional SQLite tanpa risiko kehilangan data (zero data loss).
- **Diagnostik Interaktif**: Dukungan perintah konsol `StorageManager.getEngineInfo()` dan `StorageManager.query(sql)` untuk pemantauan performa dan eksekusi kueri langsung.

### 2. Integrasi Jembatan Timbang & Simulator Interaktif
- **Koneksi Serial RS-232 / USB**: Terhubung langsung ke indikator timbangan jembatan truk menggunakan Web Serial API dengan konfigurasi Baud Rate fleksibel (1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200 bps; standar 9600 bps).
- **Panel Simulator Timbangan**: Simulator terpasang untuk pengujian fungsional dan pelatihan operator timbang dengan visualisasi nilai Berat Kotor (Gross), Berat Tara, dan Berat Muatan Bersih secara real-time.
- **Indikator Kestabilan**: Deteksi kestabilan pembacaan beban timbangan (STABIL / GERAK) sebelum data dikunci ke dalam formulir.

### 3. Kalkulasi Mutu Garam & Refraksi Otomatis
- **Perhitungan Berat Muatan**: Kalkulasi otomatis selisih Berat Kotor (Gross) dan Berat Tara Kendaraan.
- **Potongan Refraksi Otomatis**: Perhitungan nilai potongan refraksi persentase (%) dan konversi otomatis ke potongan kilogram (Kg).
- **Klasifikasi Mutu Garam**: Pembagian tonase hasil panen garam ke dalam dua kategori mutu:
  - **Garam K1 (Kualitas Super)**: Mutu utama garam putih bersih dengan harga acuan standar Rp 1.250/Kg.
  - **Garam K2 (Kualitas Standar)**: Mutu kedua dengan harga acuan standar Rp 1.050/Kg.
- **Kalkulasi Nilai Pembayaran**: Perhitungan otomatis subtotal K1, subtotal K2, dan Grand Total Rupiah.
- **Status Pembayaran**: Pencatatan status transaksi (Lunas / Belum Lunas).

### 4. Penerbitan Nota Timbang & Formulir Pemasok (PDF & Printer Fisik)
- **Live Paper Preview**: Pratinjau interaktif tata letak kertas sebelum dicetak ke mesin printer fisik atau diekspor ke PDF.
- **Pilihan Ukuran Kertas Standar**:
  - **A6**: Standar tiket nota timbangan ringkas.
  - **A5**: Format nota timbangan medium.
  - **A4**: Format laporan dan formulir ukuran penuh.
  - **Letter**: Format dokumen standar korporat.
  - **NCR Wartel (9.5" x 11")**: Format kertas kontinu continuous form.
- **Kop Surat & Logo Resmi**: Header resmi PT. Reka Cipta Garam lengkap dengan logo vektor tersemat, alamat kawasan industri garam Madura, dan nomor kontak.
- **Pilihan Rangkap & Tanda Tangan**: Pilihan cetak 1x, 2x, atau 3x rangkap dengan kolom tanda tangan Supir, Petugas Timbang (Weighmaster), dan Administrator.
- **Ekspor PDF Vektor Bersih**: Hasil unduhan PDF presisi tinggi tanpa border atau margin berlebih (zero-border).

### 5. Riwayat Penimbangan (Transaction History)
- **Pencarian Cerdas Real-Time**: Pencarian cepat multi-kolom berdasarkan Nomor Dokumen/Tiket, Nomor Polisi Truk, Nama Pemasok, Nama Supir, atau Asal Daerah.
- **Filter Jenis Material Garam**: Pemfilteran transaksi berdasarkan jenis material garam (Semua Jenis Garam, Garam Curah, Garam Karung) yang tersinkronisasi langsung dengan modal dan berkas Excel.
- **Filter Rentang Tanggal**: Opsi pemfilteran tanggal harian, mingguan, bulanan, atau rentang kustom.
- **Pengelolaan Transaksi**: Menu aksi per baris transaksi untuk melihat detail lengkap, mengubah data transaksi, mencetak ulang tiket timbang, atau menghapus transaksi.
- **Pengurutan & Paginasi**: Pengurutan data Terbaru / Terlama serta pilihan ukuran halaman (10, 25, 50 baris).

### 6. Riwayat Pemasok (Supplier History)
- **Rekapitulasi Akumulasi Per Pemasok**: Ringkasan data pasokan garam, tonase K1, tonase K2, subtotal, dan grand total per transaksi pemasok.
- **Filter Pemasok Terintegrasi**: Pemfilteran rekapitulasi berdasarkan nama pemasok (Semua Pemasok dan daftar nama pemasok aktif di basis data).
- **Cetak Formulir Pemasok**: Penerbitan formulir bukti penyerahan garam khusus pemasok dengan live preview dan multi-copy.
- **Export Excel Khusus Pemasok**: Ekspor spreadsheet rekapitulasi pemasok yang tersaring sesuai pemasok terpilih.

### 7. Dashboard & Analitik Tonase Interaktif
- **Kartu Ringkasan Metrik**: Total Berat Bersih Periode, Total Nilai Pembayaran Periode, dan Rata-rata Tonase per Transaksi.
- **Grafik Transaksi Mingguan**: Tren tonase penimbangan per minggu (dimulai dari baseline 26 Juli 2026).
- **Pie Chart Mutu Garam**: Komposisi perbandingan tonase Garam K1 terhadap Garam K2.
- **Double Donut Chart Sebaran Wilayah (Hierarchical Sunburst)**:
  - **Cincin Bagian Dalam (Inner Ring)**: Sebaran tonase berdasarkan Kabupaten di Madura (Sampang, Pamekasan, Sumenep).
  - **Cincin Bagian Luar (Outer Ring)**: Sebaran detail per Desa/Kecamatan asal garam yang posisinya terkelompok secara harmonis tepat di bawah busur Kabupaten masing-masing.
  - **Cascaded Legend Toggling**: Menekan nama Kabupaten pada legenda akan otomatis menyembunyikan atau menampilkan irisan Kabupaten tersebut beserta seluruh Desa anakannya.

### 8. Ekspor Spreadsheet Excel Presisi Tinggi (.xlsx) via ExcelJS
- **Standar Tata Letak Korporat**: Output berkas Excel yang diformat khusus sesuai standar buku besar pembukuan PT. Reka Cipta Garam.
- **Filter Lingkup Fleksibel**: Pemfilteran ekspor berdasarkan tanggal hari ini, tanggal tertentu, rentang tanggal, jenis material garam (Garam Curah / Garam Karung), maupun nama pemasok tertentu secara otomatis.
- **Penamaan Berkas Cerdas**: Penamaan berkas otomatis sesuai konteks filter (contoh: `PT_Reka_Cipta_Garam_Rekap_Pemasok_H_Mahmud_2026-09-04.xlsx` atau `PT_Reka_Cipta_Garam_Garam_Curah_2026-09-04.xlsx`).
- **Header Navy Blue (#0F4C81)**: Judul kolom profesional dengan font tebal putih dan fitur AutoFilter aktif pada seluruh header.
- **Format Angka & Mata Uang**: Format numerik rapi dengan desimal bobot (`#,##0.0`) dan mata uang Rupiah (`"Rp " #,##0`).
- **Baris Total Pale Gold (#FFF2CC)**: Baris ringkasan di bagian bawah yang dilengkapi formula otomatis AutoSum `=SUM()`.

### 9. Manajemen Pengguna & Hak Akses Granular (RBAC Matrix)
- **Panel Manajemen Akun 2-Kolom**: Pengaturan daftar pemakai sistem dengan matriks hak akses granular per modul.
- **Matriks Hak Akses Modul**: Pengaturan izin Lihat (View), Tambah (Add), Ubah (Edit), dan Hapus (Delete) untuk modul Pemasok, Material, Transaksi, dan Laporan.
- **Otoritas Khusus Sistem**:
  - Hak Akses Cetak Ulang Tiket Nota
  - Hak Akses Pengaturan Konfigurasi Sistem
  - Hak Akses Kelola Pengguna & Hak Akses
  - Hak Akses Pencadangan & Reset Database
- **Aksi Pengguna**: Tambah Pengguna Baru, Ubah Kata Sandi, Hapus Pengguna, serta tombol cepat Pilih Semua dan Kosongkan Semua.

### 10. Audit Trail & Activity Log
- **Pencatatan Aktivitas Otomatis**: Seluruh aktivitas penting (Login, Tambah Transaksi, Edit Transaksi, Hapus Transaksi, Reset Database) tercatat otomatis di tabel `activity_logs`.
- **Validasi Alasan Wajib**: Setiap tindakan penghapusan atau reset data mewajibkan input alasan tertulis sebelum dieksekusi demi kepatuhan audit.

### 11. Pencadangan Data, Pemulihan, & Proteksi Zona Bahaya
- **Dukungan Ganda Format Cadangan**: Mendukung format database biner SQLite (`.sqlite`) dan berkas log JSON (`.json`).
- **Slot Pemulihan Auto-Backup**: Penyimpanan otomatis slot cadangan lokal terakhir yang dapat dipulihkan sewaktu-waktu.
- **Zona Bahaya (Reset Data)**: Opsi penghapusan seluruh data transaksi dengan proteksi konfirmasi ganda, input alasan wajib, dan pencatatan audit log permanen.

### 12. Standar Desain Antarmuka Industrial (Design System)
- **Mode Gelap & Mode Terang**: Dukungan tema gelap (Dark Mode) dan tema terang (Light Mode) yang nyaman untuk operasional siang maupun malam.
- **Tipografi Terpadu**: Menggunakan font Plus Jakarta Sans untuk keterbacaan tinggi.
- **Ikon Vektor Bersih**: Seluruh ikon antarmuka menggunakan SVG industrial murni tanpa penggunaan emoji.

---

## Daftar Pengguna & Hak Akses Bawaan (Default Login)

Sistem menyediakan 3 akun bawaan untuk berbagai tingkat kewenangan operasional:

| Username | Password | Peran (Role) | Hak Akses & Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **Administrator** | Akses penuh ke seluruh sistem: Dashboard, Input Timbang, Riwayat Penimbangan, Riwayat Pemasok, Activity Log, Hak Akses Pengguna, Konfigurasi Sistem, dan Backup Basis Data. |
| **operator** | `operator123` | **Operator** | Akses operasional harian: Input Penimbangan Truk, Cetak Tiket Timbang, Riwayat Penimbangan, dan Riwayat Pemasok. |
| **supervisor** | `supervisor123` | **Supervisor** | Akses pengawasan & audit: Monitoring Dashboard & Analitik Tonase, Tinjau Riwayat Penimbangan & Pemasok, Cetak Ulang Dokumen, dan Ekspor Laporan Excel (Read-Only). |

---

## Panduan Menjalankan Aplikasi

### Cara 1: Menjalankan Aplikasi Desktop (Electron)
1. Buka folder utama proyek ini.
2. Klik ganda file:
   - **`run-app.bat`**
3. Jendela aplikasi desktop akan terbuka dan siap digunakan.

---

### Cara 2: Menjalankan via Terminal (Node.js)
Pastikan komputer telah terpasang **Node.js** (versi 18 atau lebih baru):
```bash
# 1. Pasang dependensi proyek (hanya saat pertama kali)
npm install

# 2. Jalankan aplikasi
npm start
```

---

### Cara 3: Menjalankan via Web Browser (XAMPP / Web Server)
1. Pastikan modul Apache di **XAMPP Control Panel** telah aktif.
2. Buka peramban web (Google Chrome atau Microsoft Edge), lalu akses alamat:
   ```text
   http://localhost/RCG/
   ```

---

## Panduan Kompilasi Installer Windows (.EXE)

Untuk membuat berkas installer mandiri Windows:

1. Jalankan berkas batch:
   - **`build-exe.bat`**
   *(atau jalankan perintah `npm run dist` pada terminal)*
2. Berkas hasil kompilasi akan tersimpan di dalam folder **`dist/`**:
   - **`dist/RCG Salt Weighing System Setup 8.0.0.exe`** (Installer Setup Windows)
   - **`dist/RCG Salt Weighing System 8.0.0.exe`** (Versi Portable Standalone)
   - **`dist/win-unpacked/RCG Salt Weighing System.exe`** (Versi Unpacked)

---

## Panduan Verifikasi Basis Data SQLite

Untuk memastikan dan memverifikasi integritas mesin SQLite:

1. **Uji Mesin via Terminal**:
   ```bash
   node scripts/test-sqlite-engine.js
   ```
2. **Uji Diagnostik via Console Browser/Electron (Tekan F12 atau Ctrl+Shift+I)**:
   ```javascript
   // Melihat status engine dan ukuran database
   StorageManager.getEngineInfo();

   // Menjalankan query SQL langsung
   StorageManager.query("SELECT doc_no, supplier, grand_total, payment_status FROM transactions");
   ```
3. **Pemeriksaan File Biner**:
   - Unduh berkas melalui menu *Backup & Manajemen Data -> Unduh Basis Data (.sqlite)*.
   - Buka berkas `.sqlite` menggunakan aplikasi DB Browser for SQLite atau DBeaver.

---

## Struktur Direktori Proyek

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
│   │   ├── sql-wasm.js           # Mesin SQLite3 WebAssembly Engine (sql.js)
│   │   ├── sql-wasm.wasm         # Modul biner WebAssembly SQLite 3
│   │   ├── chart.umd.min.js      # Pustaka Chart.js lokal (Offline Mode)
│   │   ├── exceljs.min.js        # Pustaka ExcelJS lokal untuk spreadsheet berdesain
│   │   ├── xlsx.full.min.js      # Pustaka SheetJS lokal (Offline Mode)
│   │   └── html2pdf.bundle.min.js# Pustaka konversi PDF lokal (Offline Mode)
│   └── js/
│       ├── storage.js            # Basis data SQLite & activity log audit
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
│   ├── generate-icons.js         # Generator otomatis ikon multi-resolusi
│   └── test-sqlite-engine.js     # Skrip verifikasi & uji diagnostik SQLite Engine
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

(c) 2026 **PT. Reka Cipta Garam**. *All Rights Reserved.*
Sistem Informasi Jembatan Timbang Terintegrasi Kawasan Industri Garam Madura.
