# PT. Reka Cipta Garam - Salt Weighing System v8.0

Sistem Informasi Penimbangan Truk Garam Industri modern berbasis **Electron Desktop & Web Application** untuk **PT. Reka Cipta Garam**.

Aplikasi ini dirancang khusus untuk mempermudah operasional harian, operator timbang, dan manajemen dalam mencatat transaksi penimbangan kendaraan truk garam, integrasi langsung dengan indikator jembatan timbang serial RS-232 / USB (dengan deteksi port COM fisik otomatis dan pengurai multi-protokol indikator), kalkulasi refraksi otomatis dan pembagian mutu garam (Garam K1 & Garam K2), penerbitan tiket timbang resmi (PDF vektor presisi tinggi), penanganan cetak multi-transaksi adaptif, pengaturan margin in-app fleksibel (satuan mm dan cm), dialog cetak lapang (980px), rekapitulasi riwayat pemasok terakumulasi harian dengan emblem status pembayaran interaktif, analitik tonase interaktif, kontrol akses berbasis peran (RBAC), serta manajemen basis data relasional SQLite.

---

## Daftar Fitur Lengkap Sistem (v8.0)

### 1. Basis Data Relasional SQLite Engine (SQLite 3 via sql.js WebAssembly)
- **Format Database Standar Industri**: Penyimpanan data transaksi penimbangan, akun pengguna, audit log aktivitas, dan pengaturan sistem menggunakan format basis data relasional standar **SQLite 3** murni (`data/rcg_database.sqlite`).
- **Skema Tabel Relasional**:
  - `transactions`: Menyimpan data transaksi lengkap:
    - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
    - `doc_no` (TEXT UNIQUE) - Nomor tiket/dokumen timbang resmi
    - `date` (TEXT) - Tanggal transaksi (YYYY-MM-DD)
    - `time_in` / `time_out` (TEXT) - Jam penimbangan masuk dan keluar
    - `supplier` (TEXT) - Nama pemasok garam
    - `plate_no` (TEXT) - Nomor polisi armada truk
    - `driver_name` (TEXT) - Nama pengemudi/supir kendaraan
    - `material` (TEXT) - Jenis garam (Garam Curah / Garam Karung)
    - `origin_area` / `origin_region` (TEXT) - Asal daerah dan desa/kabupaten
    - `gross_weight` / `tare_weight` / `net_weight` (REAL) - Berat kotor, tara, dan muatan (Kg)
    - `refraction_percent` / `refraction_weight` (REAL) - Potongan refraksi persentase dan bobot (Kg)
    - `final_net_weight` (REAL) - Berat bersih akhir yang diperhitungkan (Kg)
    - `k1_weight` / `k2_weight` (REAL) - Pembagian tonase mutu Garam K1 dan K2
    - `k1_price` / `k2_price` (REAL) - Harga satuan per Kg mutu K1 dan K2
    - `k1_subtotal` / `k2_subtotal` (REAL) - Nilai subtotal per mutu (Rp)
    - `grand_total` (REAL) - Total nilai pembayaran transaksi (Rp)
    - `payment_status` (TEXT DEFAULT 'Belum Lunas') - Status pembayaran ('Lunas' / 'Belum Lunas')
    - `notes` (TEXT) - Catatan operasional
    - `operator_name` (TEXT) - Petugas timbang / admin penerbit
    - `created_at` / `updated_at` (TEXT) - Timestamp pembuatan dan pembaruan data
  - `users`: Menyimpan kredensial pengguna, peran (Role), serta matriks izin modular (RBAC).
  - `activity_logs`: Menyimpan jejak audit sistem (timestamp, username, role, aksi, no dokumen, dan alasan/keterangan).
  - `app_settings`: Menyimpan konfigurasi jembatan timbang, printer, toleransi, dan parameter perusahaan.
- **Indeks Performa Tinggi**: Dilengkapi indeks sekunder untuk pencarian dan pemfilteran instan tanpa latensi (`idx_tx_date`, `idx_tx_supplier`, `idx_tx_docno`, `idx_logs_time`).
- **Unduh Basis Data (.sqlite)**: Fitur ekspor biner database SQLite murni yang dapat dibuka langsung melalui perangkat lunak manajemen basis data seperti DB Browser for SQLite, DBeaver, atau TablePlus.
- **Impor Basis Data (.sqlite)**: Fitur pemulihan dan migrasi basis data SQLite secara langsung dari berkas biner `.sqlite`.
- **Auto-Migration Cerdas**: Mekanisme migrasi otomatis yang mengonversi data legacy dari format JSON / localStorage ke tabel relasional SQLite tanpa risiko kehilangan data (zero data loss).
- **Diagnostik Interaktif**: Dukungan perintah konsol `StorageManager.getEngineInfo()` dan `StorageManager.query(sql)` untuk pemantauan performa dan eksekusi kueri langsung.

### 2. Integrasi Perangkat Keras Jembatan Timbang & Simulator Interaktif
- **Deteksi Port COM Fisik Otomatis (Windows Registry)**: Sistem secara cerdas membaca langsung daftar port serial aktif pada sistem operasi Windows melalui query Registry `HKLM\HARDWARE\DEVICEMAP\SERIALCOMM` via proses utama Electron. Pengguna tidak perlu menebak nomor COM port secara manual.
- **Pemilihan Port Fleksibel**: Dropdown pemilihan port COM dengan tombol "Pindai Ulang" dan badge status kesiapan perangkat.
- **Pengikatan Port Terarah (Targeted Port Binding)**: Penanganan event `session.on('select-serial-port')` yang mengunci port yang dipilih oleh pengguna secara instan tanpa dialog sistem tambahan.
- **Deteksi Hotplug Dinamis (Auto Hotplug Detection)**: Pendeteksian otomatis kabel converter USB-to-RS232 saat dicolokkan (`serial-port-added`) atau dicabut (`serial-port-removed`) dengan pembaruan daftar port secara real-time.
- **Pengurai Multi-Protokol Indikator Timbangan (Multi-Protocol Parser)**:
  - **Yaohua XK3190-A12E**: Protokol kontinu dengan pembacaan paket terbalik `=DDDDDD` (contoh: `=005610` dibalik menjadi `016500` menghasilkan bobot 16.500 Kg).
  - **CAS CI-Series (CI-1500A, CI-1560A, CI-2001A)**: Format paket standar `ST,GS,+016500kg\r\n` atau `US,GS,...` dengan deteksi status kestabilan `ST` (Stabil) dan `US` (Bergerak / Tidak Stabil).
  - **Toledo / Mettler Toledo**: Format transmisi kontinu ASCII standar industri jembatan timbang.
  - **Generic ASCII**: Penguraian otomatis nilai numerik bertanda dengan satuan kilogram (`kg`), ton (`t`), atau gram (`g`).
- **Penanganan Pembatas Baris Universal**: Mendukung pembagian paket data berdasarkan Carriage Return (`\r` / `0x0D`) dan Newline (`\n` / `0x0A`) menggunakan regex `/[\r\n]+/` sehingga kompatibel dengan seluruh indikator timbangan truk di Indonesia.
- **Monitor Data Mentah Real-Time (Live Raw Stream Monitor)**: Terminal visual mini di dalam modal koneksi serial yang menampilkan byte mentah yang diterima dari indikator, penanda waktu (timestamp), dan hasil parsing bobot terkini.
- **Penanganan Pemutusan Kabel Aman (Safe Disconnection Handling)**: Menangani pencabutan kabel fisik saat penimbangan berlangsung secara aman tanpa membuat aplikasi macet (freeze) atau crash, serta mereset status UI menjadi terputus secara otomatis.
- **Baud Rate Fleksibel**: Pilihan kecepatan komunikasi data mulai dari 1200, 2400, 4800, 9600, 19200, 38400, 57600, hingga 115200 bps (standar industri: 9600 bps).
- **Panel Simulator Timbangan Terintegrasi**: Simulator terpasang untuk pengujian fungsional dan pelatihan operator timbang dengan visualisasi nilai Berat Kotor (Gross), Berat Tara, dan Berat Muatan Bersih secara real-time.
- **Injeksi Data Pengujian**: Dukungan metode pengujian `ScaleEngine.injectTestData()` untuk simulasi data paket indikator Yaohua, CAS, dan Toledo secara programatik.

### 3. Kalkulasi Mutu Garam & Refraksi Otomatis
- **Perhitungan Berat Muatan**: Kalkulasi otomatis selisih Berat Kotor (Gross) dan Berat Tara Kendaraan.
- **Potongan Refraksi Otomatis**: Perhitungan nilai potongan refraksi persentase (%) dan konversi otomatis ke potongan kilogram (Kg).
- **Klasifikasi Mutu Garam**: Pembagian tonase hasil panen garam ke dalam dua kategori mutu:
  - **Garam K1 (Kualitas Super)**: Mutu utama garam putih bersih dengan harga acuan standar Rp 1.250/Kg.
  - **Garam K2 (Kualitas Standar)**: Mutu kedua dengan harga acuan standar Rp 1.050/Kg.
- **Kalkulasi Nilai Pembayaran**: Perhitungan otomatis subtotal K1, subtotal K2, dan Grand Total Rupiah.
- **Status Pembayaran**: Pencatatan status transaksi (Lunas / Belum Lunas) dengan hak akses pengubahan terproteksi.

### 4. Penerbitan Nota Timbang, Pengaturan Margin In-App, & Ekspor PDF
- **Dialog Cetak Lapang & Proporsional (Lebar 980px)**: Modal pengaturan pratinjau cetak (`#modal-print-settings`) dirancang dengan lebar 980px dan tata letak dua kolom yang lega, mencegah desakan teks dan kebocoran tata letak kontrol.
- **Penanganan Transaksi Banyak & Nomor Polisi Multipel**:
  - Tata letak dokumen pratinjau dan hasil unduhan PDF mampu mengakomodasi banyak nomor polisi dan rincian muatan sekaligus secara rapi.
  - Bagian penting dokumen (No. Dokumen, Nama Pemasok, Asal Material, Waktu Keluar) pada kolom kanan tetap tampil lengkap, jelas, dan proporsional tanpa risiko teks terpotong atau tertutup.
  - Pembagian baris dan tinggi baris tabel menyesuaikan muatan konten secara dinamis (adaptive height).
- **Pengaturan Margin In-App Fleksibel (mm / cm)**:
  - **Preset Margin Instan**: Standar (5 mm / 0.5 cm), Sempit (2 mm / 0.2 cm), Sedang (8 mm / 0.8 cm), Lebar (12 mm / 1.2 cm), dan Kustom.
  - **Pemilih Satuan Terintegrasi**: Pilihan satuan Milimeter (`mm`) atau Sentimeter (`cm`) dengan konversi nilai otomatis.
  - **Input Margin Granular**: Pengaturan batas margin per sisi (Atas/Top, Bawah/Bottom, Kiri/Left, Kanan/Right) untuk kebutuhan pencetakan presisi.
  - **Live Dynamic Preview**: Pratinjau dokumen di layar menyesuaikan margin dan padding secara langsung saat pengaturan diubah.
- **Kop Surat & Header Resmi Gambar**: Header resmi PT. Reka Cipta Garam menggunakan berkas gambar kop surat resmi (`kop surat nota timbang.webp`) lengkap dengan identitas korporat Subsidiary Bawang Mas Grup.
- **Tabel Nota Timbang Ringkas & Rapi**: Tampilan dokumen fokus, bersih, bebas teks terpotong, menyajikan rincian bobot dua kolom, rincian mutu K1 & K2 dua kolom, dan kotak aksen total pembayaran.
- **Format Asal Material Terpadu**: Penyajian nama wilayah dan desa (contoh: `Pamekasan - Majungan`) yang tertata rapi tanpa celah pemisah teks ekstrem.
- **Fitur Cetak Langsung (Direct Print)**: Tombol "Cetak Dokumen" yang mengirim dokumen langsung ke antrean mesin printer fisik sistem dengan aturan `@page` margin otomatis.
- **Pilihan Ukuran Kertas Standar**:
  - **A6 (105 x 148 mm)**: Standar tiket nota timbangan ringkas 1 halaman.
  - **A5 (148 x 210 mm)**: Format nota timbangan medium.
  - **A4 (210 x 297 mm)**: Format laporan dan formulir ukuran penuh.
  - **Letter (8.5" x 11")**: Format dokumen standar korporat.
  - **NCR Continuous Sheet (9.5" x 11")**: Format kertas continuous form untuk printer dot matrix dan NCR.
- **Pilihan Rangkap & Tanda Tangan**: Pilihan cetak 1x, 2x, atau 3x rangkap dengan kolom tanda tangan Supir Kendaraan dan Petugas Timbang / Admin.
- **Ekspor PDF Vektor Bersih**: Hasil unduhan PDF presisi tinggi berbasis offscreen renderer Electron tanpa distorsi, tidak membeku (no freezing), dan pas dalam 1 halaman.

### 5. Formulir Input Penimbangan & Tombol Ambil Bobot
- **Tombol Ambil Bobot**: Tombol pada kolom Berat Kotor (Gross) dan Berat Tara menggunakan label "Ambil" dengan warna aksen biru standar `#3671c6`.
- **Integrasi Cepat Simulator & Timbangan**: Penangkapan nilai bobot aktif langsung ke field input dengan verifikasi kestabilan.

### 6. Riwayat Penimbangan (Transaction History)
- **Pencarian Cerdas Real-Time**: Pencarian cepat multi-kolom berdasarkan Nomor Dokumen/Tiket, Nomor Polisi Truk, Nama Pemasok, Nama Supir, atau Asal Daerah.
- **Filter Jenis Material Garam**: Pemfilteran transaksi berdasarkan jenis material garam (Semua Jenis Garam, Garam Curah, Garam Karung) yang tersinkronisasi langsung dengan modal dan berkas Excel.
- **Filter Rentang Tanggal**: Opsi pemfilteran tanggal harian, mingguan, bulanan, atau rentang kustom.
- **Emblem Status Pembayaran Interaktif**:
  - Menampilkan status **Lunas** (`badge-success`, Emerald `#22C55E`) dan **Belum Lunas** (`badge-warning`, Amber `#F59E0B`) sesuai standar DESIGN_SYSTEM.md.
  - Diformat sebagai elemen tombol dengan tinggi 26px, padding 0 10px, font 11px tebal 600, dan border 1px solid.
  - Pengguna dengan wewenang (Administrator dan Supervisor) dapat langsung mengklik emblem untuk beralih status secara langsung, disertai pencatatan audit log otomatis.
  - Untuk Operator, emblem tampil dalam mode baca saja (Read-Only) dengan tooltip penjelas.
- **Pengelolaan Transaksi**: Menu aksi per baris transaksi untuk melihat detail lengkap, mengubah data transaksi, mencetak ulang tiket timbang, atau menghapus transaksi (sesuai hak akses role).
- **Pengurutan & Paginasi**: Pengurutan data Terbaru / Terlama serta pilihan ukuran halaman (10, 25, 50 baris).

### 7. Riwayat Pemasok (Supplier History) Terintegrasi
- **Aturan Grouping / Akumulasi Transaksi Harian**:
  - Satu baris tabel merepresentasikan 1 pemasok pada 1 tanggal pengiriman.
  - Seluruh transaksi dari pemasok yang sama pada tanggal yang sama secara otomatis digabung dan diakumulasikan menjadi satu baris rekapitulasi.
  - Menampilkan jumlah total transaksi/pengiriman, akumulasi berat muatan, berat tara, berat bersih total, mutu K1, mutu K2, subtotal K1, subtotal K2, dan total pembayaran.
- **Emblem Status Pembayaran Selaras & Sinkronisasi Massal**:
  - Tampilan emblem **Lunas** (`badge-success`, Emerald `#22C55E`) dan **Belum Lunas** (`badge-warning`, Amber `#F59E0B`) dibuat identik 100% dengan Riwayat Penimbangan dari dimensi (tinggi 26px, padding 0 10px, border 1px solid, font 11px tebal 600), tipografi, warna palet DESIGN_SYSTEM.md, hingga interaktivitas klik role-based.
  - Mengklik emblem pada baris rekapitulasi pemasok (`SupplierHistoryManager.togglePaymentStatus()`) akan beralih status dan secara otomatis memperbarui status pembayaran seluruh transaksi anggota dalam kelompok pemasok dan tanggal tersebut.
  - Perubahan status secara instan disinkronkan ke tabel Riwayat Penimbangan, penyimpanan data SQLite, dan kartu metrik dashboard tanpa perlu memuat ulang halaman.
  - Pengguna tanpa wewenang (Operator) memiliki akses *Read-Only* dengan opacity 0.9 dan tooltip penjelas hak akses.
- **Format Dokumen Selaras dengan Riwayat Penimbangan**:
  - Dokumen cetak rekapitulasi harian pemasok menggunakan format dokumen **Nota Timbang A6** resmi yang sama persis dengan modul Riwayat Penimbangan (lengkap dengan kop surat, rincian bobot, rincian mutu garam, box total pembayaran, dan tanda tangan).
- **Tampilan Tabel Proporsional & Responsif**:
  - Kolom tabel tertata rapi (Tanggal, Nama Pemasok, Transaksi, Netto, K1, K2, Subtotal K1, Subtotal K2, Total Bayar, Status, Aksi).
  - Kolom asal daerah dilengkapi pemotongan teks otomatis (truncation) dengan tooltip nama lengkap untuk mencegah teks meluap.
  - Tombol aksi berlabel "Cetak" seragam dengan tombol di Riwayat Penimbangan, bebas dari kebocoran layout atau teks terpotong.
- **Searchable Combobox & Sugesti Otomatis**: Fitur filter pemasok fleksibel di mana pengguna dapat memilih langsung dari dropdown atau mengetik huruf/nama untuk mendapatkan rekomendasi nama pemasok secara real-time.
- **Export Excel Khusus Pemasok**: Ekspor spreadsheet rekapitulasi data pemasok yang tersaring sesuai pemasok dan tanggal terpilih.

### 8. Dashboard & Analitik Tonase Interaktif
- **Kartu Ringkasan Metrik**: Total Berat Bersih Periode, Total Nilai Pembayaran Periode, dan Rata-rata Tonase per Transaksi.
- **Grafik Transaksi Mingguan**: Tren tonase penimbangan per minggu (dimulai dari baseline 26 Juli 2026).
- **Pie Chart Mutu Garam**: Komposisi perbandingan tonase Garam K1 terhadap Garam K2.
- **Double Donut Chart Sebaran Wilayah (Hierarchical Sunburst)**:
  - **Cincin Bagian Dalam (Inner Ring)**: Sebaran tonase berdasarkan Kabupaten di Madura (Sampang, Pamekasan, Sumenep).
  - **Cincin Bagian Luar (Outer Ring)**: Sebaran detail per Desa/Kecamatan asal garam yang posisinya terkelompok tepat di bawah busur Kabupaten masing-masing.
  - **Cascaded Legend Toggling**: Menekan nama Kabupaten pada legenda akan otomatis menyembunyikan atau menampilkan irisan Kabupaten tersebut beserta seluruh Desa anakannya.

### 9. Ekspor Spreadsheet Excel Presisi Tinggi (.xlsx) via ExcelJS
- **Modal Ekspor Berdimensi Lapang (Lebar 540px)**: Modal ekspor Excel (`#modal-export-excel`) memberikan ruang yang cukup bagi pemilihan rentang tanggal dan filter spesifik tanpa layout bertumpuk.
- **Standar Tata Letak Korporat**: Output berkas Excel yang diformat khusus sesuai standar buku besar pembukuan PT. Reka Cipta Garam.
- **Filter Lingkup Fleksibel & Autocomplete**: Pemfilteran ekspor berdasarkan tanggal hari ini, tanggal tertentu, rentang tanggal, jenis material garam (Garam Curah / Garam Karung), maupun nama pemasok tertentu (dilengkapi fitur input sugesti pencarian otomatis).
- **Penamaan Berkas Cerdas**: Penamaan berkas otomatis sesuai konteks filter (contoh: `PT_Reka_Cipta_Garam_Rekap_Pemasok_H_Mahmud_2026-09-04.xlsx` atau `PT_Reka_Cipta_Garam_Garam_Curah_2026-09-04.xlsx`).
- **Header Navy Blue (#0F4C81)**: Judul kolom profesional dengan font tebal putih dan fitur AutoFilter aktif pada seluruh header.
- **Format Angka & Mata Uang**: Format numerik rapi dengan desimal bobot (`#,##0.0`) dan mata uang Rupiah (`"Rp " #,##0`).
- **Baris Total Pale Gold (#FFF2CC)**: Baris ringkasan di bagian bawah yang dilengkapi formula otomatis AutoSum `=SUM()`.

### 10. Manajemen Pengguna & Hak Akses Berbasis Peran (RBAC)
- **Panel Manajemen Akun 2-Kolom**: Pengaturan daftar pemakai sistem dengan matriks hak akses granular per modul.
- **Matriks Hak Akses Modul**: Pengaturan izin Lihat (View), Tambah (Add), Ubah (Edit), dan Hapus (Delete) untuk modul Pemasok, Material, Transaksi, dan Laporan.
- **Otoritas Khusus Sistem**:
  - Hak Akses Cetak Ulang Tiket Nota
  - Hak Akses Pengubahan Status Pembayaran (Lunas / Belum Lunas)
  - Hak Akses Pengaturan Konfigurasi Sistem
  - Hak Akses Kelola Pengguna & Hak Akses
  - Hak Akses Pencadangan & Reset Database
- **Aksi Pengguna**: Tambah Pengguna Baru, Ubah Kata Sandi, Hapus Pengguna, serta tombol cepat Pilih Semua dan Kosongkan Semua.
- **Proteksi Perubahan Belum Disimpan**: Dialog konfirmasi otomatis saat tombol Tutup ditekan jika ada perubahan hak akses yang belum disimpan.

#### Matriks Hak Akses Berdasarkan Peran (Role Permission Matrix)

| Fitur / Modul Operasional | Administrator | Supervisor | Operator |
| :--- | :---: | :---: | :---: |
| Input Penimbangan & Ambil Bobot Timbangan | Ya | Ya | Ya |
| Penerbitan & Cetak Nota Timbang Awal | Ya | Ya | Ya |
| Akses Dashboard & Analitik Tonase | Ya | Ya | Ya |
| Lihat Riwayat Penimbangan & Riwayat Pemasok | Ya | Ya | Ya |
| Ubah Status Pembayaran (Lunas / Belum Lunas) | Ya | Ya | Tidak (Read-Only) |
| Cetak Ulang Nota Timbang (Reprint) | Ya | Ya | Tidak |
| Ekspor Laporan Excel & Unduh PDF | Ya | Ya | Ya |
| Ubah (Edit) Data Transaksi | Ya | Tidak | Tidak |
| Hapus (Delete) Transaksi Penimbangan | Ya | Tidak | Tidak |
| Lihat Activity Log & Jejak Audit Sistem | Ya | Ya | Tidak |
| Konfigurasi Parameter Jembatan Timbang & Margin | Ya | Tidak | Tidak |
| Manajemen Akun Pengguna & Hak Akses RBAC | Ya | Tidak | Tidak |
| Unduh Cadangan Basis Data (.sqlite / .json) | Ya | Tidak | Tidak |
| Impor & Pemulihan Basis Data (.sqlite) | Ya | Tidak | Tidak |
| Reset & Penghapusan Basis Data (Danger Zone) | Ya | Tidak | Tidak |

### 11. Audit Trail & Activity Log
- **Pencatatan Aktivitas Otomatis**: Seluruh aktivitas penting (Login, Tambah Transaksi, Edit Transaksi, Hapus Transaksi, Ubah Status Bayar Satuan / Massal, Reset Database) tercatat otomatis di tabel `activity_logs`.
- **Validasi Alasan Wajib**: Setiap tindakan sensitif (seperti penghapusan atau reset data) mewajibkan input alasan tertulis sebelum dieksekusi demi kepatuhan audit.

### 12. Pencadangan Data, Pemulihan, & Proteksi Zona Bahaya
- **Dukungan Ganda Format Cadangan**: Mendukung format database biner SQLite (`.sqlite`) dan berkas log JSON (`.json`).
- **Slot Pemulihan Auto-Backup**: Penyimpanan otomatis slot cadangan lokal terakhir yang dapat dipulihkan sewaktu-waktu.
- **Zona Bahaya (Reset Data)**: Opsi penghapusan seluruh data transaksi dengan proteksi konfirmasi ganda, input alasan wajib, dan pencatatan audit log permanen.

### 13. Standar Desain Antarmuka Industrial (Design System)
- **Mode Gelap & Mode Terang**: Dukungan tema gelap (Dark Mode) dan tema terang (Light Mode) yang nyaman untuk operasional siang maupun malam.
- **Kustomisasi Text Selection & Highlight**:
  - **Dark Mode**: Background seleksi kursor berwarna `#D69E2E` (Warm Gold) dan teks `#FFFFFF`.
  - **Light Mode**: Background seleksi kursor berwarna `#3671C6` (Primary Blue) dan teks `#FFFFFF`.
- **Palet Warna Status Terpadu**:
  - Success (`#22C55E`): Status Lunas, Indikator Aktif, Simpan Berhasil.
  - Warning (`#F59E0B`): Status Belum Lunas, Peringatan Sistem, Pending.
  - Error (`#EF4444`): Gagal, Galat, Tindakan Destruktif.
  - Info (`#38BDF8`): Informasi Sistem, Panduan.
  - Primary Blue (`#3671C6`): Aksi Utama, Tombol Ambil Bobot, Header Dokumen.
- **Tipografi Terpadu**: Menggunakan font Plus Jakarta Sans untuk teks antarmuka dan font monospace untuk angka numerik, nomor dokumen, dan nilai bobot.
- **Ikon Vektor Bersih**: Seluruh ikon antarmuka menggunakan SVG industrial murni tanpa penggunaan emoji.
- **Modul Tentang Sistem & Lisensi**:
  - Penyajian identitas entitas pengembang, legalitas kepemilikan PT. Reka Cipta Garam, dan atribusi lisensi open-source pihak ketiga (Electron, SQLite, Chart.js, SheetJS, html2pdf, Plus Jakarta Sans).
  - Tautan profil GitHub tim pengembang yang terproteksi dengan penanganan pembukaan peramban eksternal bawaan via `shell.openExternal`.

---

## Daftar Pengguna & Hak Akses Bawaan (Default Login)

Sistem menyediakan 3 akun bawaan untuk berbagai tingkat kewenangan operasional. Antarmuka login menerapkan alur otentikasi standar industri yang aman dan terproteksi (kredensial langsung tanpa tombol pintas demo):

| Username | Password | Peran (Role) | Hak Akses & Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **Administrator** | Akses penuh ke seluruh sistem: Dashboard, Input Penimbangan, Riwayat Penimbangan, Riwayat Pemasok, Activity Log, Hak Akses Pengguna, Konfigurasi Sistem, dan Backup Basis Data. |
| **operator** | `operator123` | **Operator** | Akses operasional harian: Input Penimbangan Truk, Cetak Tiket Timbang Awal, Lihat Riwayat Penimbangan, dan Riwayat Pemasok. |
| **supervisor** | `supervisor123` | **Supervisor** | Akses pengawasan & audit: Monitoring Dashboard & Analitik Tonase, Tinjau Riwayat Penimbangan & Pemasok, Ubah Status Pembayaran, Cetak Ulang Dokumen, dan Ekspor Laporan Excel / PDF. |

---

## Panduan Menjalankan Aplikasi

### Cara 1: Menjalankan Aplikasi Desktop (Electron)
1. Buka folder utama proyek ini.
2. Klik ganda berkas:
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
2. Skrip build secara otomatis akan mematikan proses aplikasi yang masih berjalan terlebih dahulu (`taskkill /F /IM "RCG Salt Weighing System.exe" /T` dan `electron.exe`) guna mencegah galat file locking EBUSY.
3. Berkas hasil kompilasi akan tersimpan di dalam folder **`dist/`**:
   - **`dist/RCG Salt Weighing System Setup 8.0.0.exe`** (Installer Setup Windows)
   - **`dist/RCG Salt Weighing System 8.0.0.exe`** (Versi Portable Standalone)
   - **`dist/win-unpacked/RCG Salt Weighing System.exe`** (Versi Unpacked)

---

## Panduan Pengujian & Diagnostik Sistem

### 1. Uji Pengurai Protokol Indikator Timbangan (Scale Parser Unit Test)
Untuk memastikan ketepatan penguraian data transmisi indikator timbangan:
```bash
node scripts/test-scale-parser.js
```
Skrip ini memverifikasi 6 skenario penguraian paket data:
- Indikator Yaohua XK3190-A12E (paket terbalik `=005610\r` -> 16.500 Kg)
- Indikator CAS Stabil (`ST,GS,+016500kg\r\n` -> 16.500 Kg, Stabil)
- Indikator CAS Tidak Stabil (`US,GS,+016480kg\r\n` -> 16.480 Kg, Tidak Stabil)
- Indikator CAS Net Weight (`ST,NT,+008250kg\r\n` -> 8.250 Kg, Stabil)
- Indikator Toledo Generic ASCII (`  12450 kg\r` -> 12.450 Kg, Stabil)
- Generic Signed Number (`+25000\n` -> 25.000 Kg, Stabil)

### 2. Uji Integritas Basis Data SQLite
Untuk memastikan integritas mesin SQLite WebAssembly:
```bash
node scripts/test-sqlite-engine.js
```

### 3. Uji Diagnostik via Console Browser/Electron (Tekan F12 atau Ctrl+Shift+I)
```javascript
// Melihat status engine dan ukuran database
StorageManager.getEngineInfo();

// Menjalankan query SQL langsung
StorageManager.query("SELECT doc_no, supplier, grand_total, payment_status FROM transactions");

// Menguji simulator indikator Yaohua A12E dengan data terbalik
ScaleEngine.injectTestData("=005610\r");

// Menguji simulator indikator CAS
ScaleEngine.injectTestData("ST,GS,+016500kg\r\n");
```

### 4. Pemeriksaan Berkas Biner SQLite
- Unduh berkas melalui menu *Backup & Manajemen Data -> Unduh Basis Data (.sqlite)*.
- Buka berkas `.sqlite` menggunakan aplikasi DB Browser for SQLite atau DBeaver.

---

## Struktur Direktori Proyek

```text
RCG/
├── .agents/
│   └── rules/
│       └── build-exe-rule.md     # Aturan otomatis taskkill sebelum build .exe
├── assets/
│   ├── css/
│   │   ├── style.css             # Tema utama, tata letak, & komponen
│   │   ├── dark-mode.css         # Skema warna mode gelap (Design System)
│   │   └── print-nota.css        # Format cetak nota tiket timbangan
│   ├── icons/
│   │   ├── icon.ico              # Ikon Windows Executable resmi (.exe)
│   │   └── icon.png              # Ikon resolusi tinggi
│   ├── images/
│   │   ├── RCG.webp              # Logo resmi PT. Reka Cipta Garam
│   │   └── kop surat nota timbang.webp # Kop surat nota tiket timbang resmi
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
│       ├── print-dialog.js       # Dialog live preview cetak, margin filter, & ukuran kertas
│       ├── export-excel.js       # Mesin ekspor Excel dengan AutoFilter & AutoSum
│       ├── transaction.js        # Logika input penimbangan & kalkulasi mutu
│       ├── history.js            # Riwayat transaksi penimbangan
│       ├── supplier-history.js   # Riwayat pemasok terakumulasi & cetak nota pemasok
│       ├── analytics.js          # Double Donut Chart & statistik mingguan
│       └── app.js                # Pengendali utama alur aplikasi
├── scripts/
│   ├── generate-icons.js         # Generator otomatis ikon multi-resolusi
│   ├── test-scale-parser.js      # Skrip uji unit protokol indikator timbangan serial
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

## Tim Pengembang & Kontributor

- **Software Engineering & UI/UX Design**: [Satrio Dian Nugroho](https://github.com/SATRIODIANNUGROHO)
- **Quality Assurance & Keuangan**: [M. Thufail Mahfudh](https://github.com/peenkyourbae)
- **Entitas Pemilik**: PT. Reka Cipta Garam (Subsidiary Bawang Mas Grup)

---

## Hak Cipta & Lisensi

(c) 2026 **PT. Reka Cipta Garam**. *All Rights Reserved.*  
Sistem Informasi Jembatan Timbang Terintegrasi Kawasan Industri Garam Madura.
