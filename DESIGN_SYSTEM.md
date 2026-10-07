# NEXA-RCG Precision Design System
**Enterprise Specification & Baseline Source of Truth**  
*Versi: 2.0.0 (Production Master) | Standar Rilis: Oktober 2026*  
*Cakupan Resmi: PT. Reka Cipta Garam (RCG Salt Weighing System v8.0) & NexaWorks Enterprise Platform*

---

## 1. Design System Overview
- **Nama Design System**: NEXA-RCG Precision Design System.
- **Versi**: 2.0.0 (Production Master).
- **Tujuan**: Menjadi satu-satunya acuan resmi (*single source of truth*) yang mengikat seluruh perekayasa perangkat lunak, perancang antarmuka, dan agen AI dalam membangun, memperluas, dan memelihara UI yang konsisten, berdensitas tinggi, berkinerja tinggi, dan bebas cacat tata letak.
- **Produk/Platform yang Dicakup**:
  1. *PT. Reka Cipta Garam (RCG Weighing System v8.0)*: Sistem penimbangan jembatan timbang terintegrasi perangkat keras serial RS232, pencetakan nota fisik, rekapitulasi supplier, dan analitik tonase material.
  2. *NexaWorks Enterprise Platform*: Platform manajemen operasional enterprise, payroll, absensi, audit trail, perizinan, dan HRMS.
- **Target Pengguna**: Operator jembatan timbang lapangan, staf administrasi payroll, supervisor operasional pabrik, auditor kepatuhan, dan eksekutif manajemen.
- **Prinsip Utama Desain**: Kejelasan absolut (*Clarity*), konsistensi menyeluruh (*Consistency*), hirarki visual tegas (*Hierarchy*), kepatuhan aksesibilitas (*Accessibility*), dan efisiensi alur kerja (*Efficiency*).
- **Karakter Visual**: Industrial, teknikal, presisi, terkendali (*restrained*), bersih secara editorial (*editorial clean*), berdensitas fungsional tinggi, dan mengutamakan kontras permukaan gelap (*dark-mode first*).
- **Hal yang Harus Dihindari**: Dekorasi tanpa fungsi, efek pendaran neon (*neon glow*), gradasi warna-warni yang mencolok, bentuk membulat ekstrem (*universal pill shape*), animasi lambat yang membuang waktu, font dekoratif, dan teks berbobot redup yang sulit dibaca di layar industri.
- **Definisi Singkat Identitas Brand**: Minimalis fungsional, tangguh secara industri, berkepastian data tinggi, dan elegan secara teknis.

---

## 2. Design Principles
Sembilan prinsip desain utama yang mendasari setiap keputusan antarmuka:

### 2.1 Clarity (Kejelasan)
Data adalah inti sistem. Setiap angka berat, status transaksi, nama entitas, dan nominal rupiah harus terbaca seketika tanpa menimbulkan ambiguitas penafsiran.
- **Do**: Tampilkan satuan metrik secara eksplisit di samping angka (`37.896 Kg`, `Rp 45.430.600`).
- **Don't**: Membiarkan angka berdiri sendiri tanpa unit pengukuran atau memotong teks deskripsi penting.

### 2.2 Consistency (Konsistensi)
Satu permasalahan antarmuka hanya memiliki tepat satu solusi komponen di seluruh modul aplikasi.
- **Do**: Gunakan komponen dropdown (`custom-select` dan `custom-combobox`) dengan tinggi, border, dan padding yang identik di seluruh halaman.
- **Don't**: Membuat styling ad-hoc pada bilah filter tabel yang berbeda dari formulir input utama.

### 2.3 Hierarchy (Hirarki Visual)
Pengguna harus dipandu secara intuitif dari informasi paling kritis menuju detail pendukung melalui kontras ukuran, bobot font, dan warna permukaan.
- **Do**: Gunakan warna teks putih terang (`#FFFFFF`) untuk nilai data utama dan abu-abu netral (`#94A3B8`) untuk label pendukung.
- **Don't**: Memberikan bobot dan warna yang sama pada seluruh teks dalam satu kartu data.

### 2.4 Accessibility (Aksesibilitas)
Kepatuhan penuh pada standar WCAG 2.1 Level AA dengan rasio kontras minimum 4.5:1 untuk teks normal dan 3:1 untuk elemen interaktif.
- **Do**: Berikan ring fokus keyboard (`:focus-visible`) setebal 2px dengan offset yang jelas pada semua elemen interaktif.
- **Don't**: Menghilangkan garis batas outline tanpa menyediakan indikator visual pengganti.

### 2.5 Efficiency (Efisiensi)
Setiap interaksi harus meminimalkan jumlah ketukan tombol dan pergerakan mouse operator di lapangan.
- **Do**: Sediakan navigasi keyboard penuh (`Tab`, `Enter`, `Arrow Up/Down`, `Esc`) pada seluruh form dan dropdown.
- **Don't**: Memaksa operator memindahkan tangan dari keyboard ke mouse hanya untuk memilih opsi pencarian.

### 2.6 Restraint (Kekangan Visual)
Hilangkan setiap elemen grafis yang tidak berkontribusi pada pemahaman data atau penyelesaian tugas.
- **Do**: Gunakan garis batas tipis 1px (`#334155`) untuk memisahkan zona informasi.
- **Don't**: Menambahkan ornamen latar belakang, bayangan tebal melayang, atau ilustrasi kartun di area transaksi.

### 2.7 Responsive Behavior (Perilaku Responsif Adaptif)
Tata letak harus dirancang dengan pendekatan desktop-first stabil, mampu beradaptasi mulus dari resolusi 1024px, 1366px, hingga 1920px tanpa tumpang tindih (*layout overlap*).
- **Do**: Gunakan `flex-shrink: 0` pada label statis agar tidak pernah tertimpa oleh kotak input saat ruang layar menyempit.
- **Don't**: Membiarkan teks label memotong atau tersembunyi di balik elemen input dropdown.

### 2.8 Performance Awareness (Kesadaran Kinerja)
Waktu muat instan dan latensi interaksi di bawah 100 milidetik pada perangkat keras stasiun timbang industri.
- **Do**: Gunakan transisi CSS murni berbasis `transform` dan `opacity` yang diakselerasi perangkat keras (GPU).
- **Don't**: Menggunakan filter blur berat yang bertumpuk pada tabel data dinamis yang memicu penurunan frame rate.

### 2.9 Content-First Design (Desain Berbasis Konten)
Dimensi kontainer ditentukan oleh panjang dan struktur data riil operasional, bukan data tiruan (*lorem ipsum*).
- **Do**: Uji tata letak dengan nama supplier terpanjang dan nominal tonase terbesar.
- **Don't**: Merancang antarmuka hanya dengan placeholder pendek yang rusak saat diisi data riil.

---

## 3. Brand Identity

### 3.1 Logo Usage & Construction
Logo utama menggabungkan simbol gelombang kristal mineral presisi dengan tipografi wordmark yang kokoh dan modern.
- **Clear Space**: Jarak bebas minimal di sekeliling logo setara dengan tinggi simbol logo itu sendiri (minimum `16px`).
- **Minimum Logo Size**: 
  - Layar Web / Desktop: tinggi `32px` (termasuk ikon dan teks).
  - Ikon App Bar / Favicon: `24×24px`.
  - Nota Fisik / Struk Tiket: lebar `18mm` pada cetak dot-matrix.
- **Logo Placement**: Terkunci di sudut kiri atas bilah header utama aplikasi (`align-items: center`).

### 3.2 Wordmark Rules
- RCG: **PT. REKA CIPTA GARAM** (sub-teks: `SALT WEIGHING SYSTEM v8.0`).
- NexaWorks: **NEXAWORKS** (sub-teks: `ENTERPRISE PLATFORM`).
- Huruf kapital penuh (*uppercase*) dengan *letter-spacing* terukur (`0.06em` s/d `0.08em`) untuk menonjolkan stabilitas korporasi.

### 3.3 Monochrome & High-Contrast Logo
- **Dark Mode**: Simbol biru safir (`#3671C6`) dengan wordmark putih murni (`#FFFFFF`).
- **Light Mode**: Simbol biru tua (`#1D4ED8`) dengan wordmark abu-abu pekat (`#0F172A`).
- **Nota Fisik Cetak**: Versi monokrom hitam pekat 100% (`#000000`) tanpa gradasi abu-abu agar hasil cetak tajam.

### 3.4 Brand Personality, Tone, & Voice
- **Tone**: Formal, objektif, tenang, dan dapat diandalkan (*authoritative, calm, objective*).
- **Personality**: Insinyur industri ahli yang menyajikan fakta akurat tanpa basa-basi pemasaran.
- **Voice**: Bahasa Indonesia baku, ringkas, dan imperatif aktif ("Simpan Transaksi", bukan "Silakan Klik Tombol Ini Untuk Menyimpan Data Anda").

---

## 4. Visual Direction

### 4.1 Overall Aesthetic
Mengadopsi gaya **Industrial Technical Minimalism**. Antarmuka terasa seperti instrumen kokpit kendali modern: permukaan datar gelap yang tenang, garis pemisah mikron, kontras tipografi tajam, dan penanda warna fungsional yang langsung menarik perhatian pada status operasional penting.

### 4.2 Editorial vs Technical Balance
- **Aspek Editorial**: Penataan tipografi judul modul, kartu ringkasan, dan teks bantuan mengadopsi kerapian majalah bisnis modern; hirarki jelas, spasi teks teratur, dan ritme baca rileks.
- **Aspek Technical**: Area tabel data, pembacaan timbangan, dan nomor faktur mengadopsi karakter instrumen laboratorium; angka tabular monospace kaku, pembagian grid ketat, dan visualisasi baris berkepadatan tinggi.

### 4.3 Surface Treatment & Density
- Kedalaman visual dibangun melalui perbedaan kecerahan permukaan (*surface luminance stratification*), bukan drop shadow berlebih.
- Densitas informasi tinggi terstruktur: jarak sel tabel kompak (`10px 14px`) untuk efisiensi ruang tanpa mengorbankan keterbacaan.

### 4.4 Visual Anti-Patterns
- Dilarang menggunakan pola grid latar belakang yang terlalu kentara (*heavy gridlines*).
- Dilarang menggunakan pola cyberpunk, teks berkedip (*blinking text*), atau font bergaya sci-fi.
- Dilarang menggunakan efek refleksi kaca semu (*fake glassmorphism*) pada panel data kritis.

---

## 5. Color System

### 5.1 Primary, Secondary, & Neutral Palette

```css
:root {
  /* Primary Identity */
  --color-primary: #3671C6;
  --color-primary-hover: #2563EB;
  --color-primary-active: #1D4ED8;
  --color-primary-subtle: rgba(54, 113, 198, 0.15);

  /* Dark Canvas & Surfaces (Default Core) */
  --color-bg-base: #0B1120;
  --color-bg-surface: #16243A;
  --color-bg-surface-elevated: #1E2D44;
  --color-bg-surface-active: #23354E;

  /* Borders & Dividers */
  --color-border-subtle: #253347;
  --color-border-default: #334155;
  --color-border-strong: #475569;
  --color-border-focus: #3671C6;

  /* Typography Colors */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-text-disabled: #475569;

  /* Status Colors */
  --color-success: #22C55E;
  --color-success-bg: rgba(34, 197, 94, 0.15);
  --color-warning: #F59E0B;
  --color-warning-bg: rgba(245, 158, 11, 0.15);
  --color-danger: #EF4444;
  --color-danger-bg: rgba(239, 68, 68, 0.15);
  --color-info: #38BDF8;
  --color-info-bg: rgba(56, 189, 248, 0.15);
}
```

### 5.2 Light Mode Palette (Full Parity)

```css
body:not(.dark-mode) {
  --color-bg-base: #F8FAFC;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-elevated: #F1F5F9;
  --color-bg-surface-active: #E2E8F0;

  --color-border-subtle: #F1F5F9;
  --color-border-default: #E2E8F0;
  --color-border-strong: #CBD5E1;
  --color-border-focus: #2563EB;

  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;
  --color-text-disabled: #CBD5E1;

  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;
  --color-primary-subtle: rgba(37, 99, 235, 0.1);
}
```

---

## 6. Typography

### 6.1 Font Stack Architecture
```css
:root {
  --font-primary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', Consolas, 'Courier New', monospace;
  --font-serif: Georgia, Cambria, 'Times New Roman', Times, serif; /* Khusus dokumen nota resmi jika diinstruksikan */
}
```

### 6.2 Aturan Penerapan Font & Rendering
- Seluruh teks antarmuka wajib dirender dengan subpixel antialiasing: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
- **Primary Font**: Digunakan untuk 90% elemen UI: Heading, Body, Navigasi, Tombol, Form, Modal, dan Notifikasi.
- **Monospace Font**: Wajib digunakan untuk Nilai Timbangan (`16.500 Kg`), Nominal Rupiah (`Rp 45.430.600`), Nomor Dokumen/Nota (`PO-RCG/2026/08/0002`), Nomor Polisi, dan Timestamp Jam/Tanggal.
- **Serif Accent**: Dilarang digunakan pada antarmuka aplikasi operasional kecuali secara eksplisit diminta untuk watermark dokumen legal tertentu.

---

## 7. Type Scale & Hierarchy

| Tingkat Tipografi | Ukuran (px) | Line Height | Bobot (Weight) | Tracking (Letter Spacing) | Penggunaan Spesifik |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Display XL** | `32px` | `1.1` | `700 Bold` | `-0.02em` | Nilai indikator timbangan berat raksasa (*live scale*) |
| **Display L** | `28px` | `1.15` | `700 Bold` | `-0.015em` | Angka grand total nota pada banner utama |
| **H1** | `24px` | `1.2` | `700 Bold` | `-0.015em` | Judul modul utama halaman (Riwayat Penimbangan, Payroll) |
| **H2** | `20px` | `1.3` | `600 SemiBold` | `-0.01em` | Judul kartu ringkasan KPI, nama sub-seksi dashboard |
| **H3** | `16px` | `1.4` | `600 SemiBold` | `0` | Header grup data form, judul dialog modal |
| **H4** | `14px` | `1.4` | `600 SemiBold` | `0` | Subjudul kartu kecil, judul seksi dalam modal |
| **Body L** | `15px` | `1.5` | `500 Medium` | `0` | Paragraf pengantar modul, pesan alert utama |
| **Body M** | `13px` | `1.5` | `400 Regular` | `0` | Data sel tabel, rincian deskripsi transaksi |
| **Body S** | `12px` | `1.4` | `400 Regular` | `0` | Keterangan pembantu form (*helper text*), teks catatan |
| **Label** | `12.5px` | `1.3` | `600 SemiBold` | `0.01em` | Label statis form (`Material:`, `Pemasok:`) |
| **Caption** | `11px` | `1.2` | `600 SemiBold` | `0.03em` | Teks status badge, tag supplier, header tabel ringkas |
| **Mono Metadata**| `13px` | `1.4` | `500 Medium` | `-0.01em` | Angka berat bersih, subtotal uang, kode nota |

---

## 8. Spacing System

### 8.1 Skala Spacing Tokens Berbasis 4px
```
--space-1   : 4px   -> Spasi mikro internal tag status
--space-2   : 8px   -> Jarak ikon ke teks, gap label ke input dropdown
--space-3   : 12px  -> Padding horizontal tombol kompak, gap antar-grup filter
--space-4   : 16px  -> Padding internal kartu standar, jarak vertikal antar-baris form
--space-5   : 20px  -> Padding header modal, spasi antar-seksi sedang
--space-6   : 24px  -> Padding kartu analitik besar, margin bawah judul modul
--space-8   : 32px  -> Jarak antar-blok kartu utama dashboard
--space-12  : 48px  -> Padding vertikal halaman dokumen utama
--space-16  : 64px  -> Jarak pemisah modul skala besar
--space-24  : 96px  -> Pembatas seksi halaman landing eksternal
--space-32  : 128px -> Margin vertikal batas maksimum layar ultra-wide
```

### 8.2 Aturan Khusus Jarak Filter dan Formulir
- **Jarak Horizontal Label ke Dropdown**: Wajib tepat **`8px`** (`gap: 8px !important; margin-left: 0;`). Dilarang di bawah 6px.
- **Jarak Antar-Elemen Form**: `12px` s/d `16px`.

---

## 9. Layout System

- **Container Width**: Max `1600px` terpusat secara horizontal di monitor desktop.
- **Reading Width**: Max `720px` untuk dokumen teks deskriptif panjang agar kenyamanan membaca terjaga.
- **Full-Width Behavior**: Area tabel arsip dan bilah live scale membentang penuh mengikuti batas kontainer halaman.
- **Section Padding**: `20px 24px` pada desktop standar (1366×768), `16px 20px` pada laptop kecil (1024×768).
- **Unified Sticky Topbar Shell**: Seluruh header atas aplikasi (`.app-topbar-wrapper`) membungkus bilah judul utama (`.app-header`) dan bilah menu navigasi tab (`.main-nav`) dalam satu kesatuan kontainer tetap (`position: sticky !important; top: 0 !important; z-index: 1000 !important; width: 100% !important; overflow: visible !important;`). Kedua bilah terkunci permanen di bagian atas layar (*frozen at the top*) saat konten halaman digulir (*scroll*).
- **Stacking Context Hierarchy**:
  - Topbar Wrapper: `z-index: 1000; overflow: visible;`
  - App Header: `z-index: 10; position: relative; overflow: visible;`
  - Main Navigation: `z-index: 5; position: relative;`
  - Profile Dropdown Menu: `z-index: 1100; position: absolute;` (mengapung di lapisan teratas tanpa terpotong atau menimbulkan celah).
  - Modal & Overlays: `z-index: 10000` s/d `100000` (melapisi seluruh area viewport termasuk sticky topbar).

---

## 10. Grid System

- **Desktop (≥ 1024px)**: 12 Kolom simetris (`gap: 16px`).
- **Tablet (768px – 1023px)**: 8 Kolom adaptif (`gap: 12px`).
- **Mobile (≤ 767px)**: 4 Kolom kompak (`gap: 8px`).
- **When NOT to use Grid**: Bilah toolbar filter tabel wajib menggunakan **Flexbox** murni (`display: flex; flex-wrap: wrap; gap: 8px;`) agar panjang dropdown menyesuaikan konten opsi secara natural.

---

## 11. Breakpoints

```
Mobile Small  : ≤ 360px
Mobile        : 361px – 480px
Tablet        : 481px – 768px
Small Desktop : 769px – 1024px
Desktop       : 1025px – 1440px (Target Core Operasional)
Large Desktop : 1441px – 1920px
Ultra-Wide    : ≥ 1921px
```

---

## 12. Responsive Design Rules

1. **What Scales**: Lebar search-box (`flex: 1; max-width: 440px; min-width: 140px;`), grafik analitik, dan kartu metrik KPI.
2. **What Wraps**: Bilah toolbar filter tabel (`.table-filter-group { flex-wrap: wrap !important; }`) pada resolusi sempit agar filter tidak memotong elemen di sampingnya.
3. **What Stacks**: Baris formulir ganda (`.form-row`) berubah menjadi satu kolom vertikal pada layar tablet dan mobile.
4. **What Preserves Size**: Label statis (`flex-shrink: 0 !important; white-space: nowrap !important;`) dan kontrol dropdown (`min-width: 175px` / `min-width: 200px`).
5. **What Becomes Scrollable**: Seluruh tabel data dibungkus `.table-responsive` (`overflow-x: auto;`) dengan indikator scrollbar tipis.

---

## 13. Border System

- **Default Border Width**: `1px solid var(--color-border-default)` (`#334155` di dark mode, `#E2E8F0` di light mode).
- **Subtle Border**: `1px solid var(--color-border-subtle)` (`#253347`) untuk garis pembatas antar-baris tabel.
- **Strong Border**: `1px solid var(--color-border-strong)` (`#475569`) untuk menu opsi popover melayang dan jendela modal.
- **Focus Border**: `1px solid var(--color-border-focus)` (`#3671C6`) dengan cincin pendaran pelindung `box-shadow: 0 0 0 2px rgba(54, 113, 198, 0.25)`.
- **Error Border**: `1px solid var(--color-danger)` (`#EF4444`) saat validasi masukan tidak valid.

---

## 14. Border Radius System

| Token Name | Nilai | Aturan Penerapan Komponen |
| :--- | :---: | :--- |
| `--radius-xs` | `2px` | Indikator progres kecil, garis bawah tab |
| `--radius-sm` | `4px` s/d `6px` | **Tombol standar, input form, select trigger, combobox, status badge** |
| `--radius-md` | `8px` | Menu dropdown melayang, kartu ringkasan kecil |
| `--radius-lg` | `10px` s/d `12px` | Kontainer kartu dashboard utama, modal dialog |
| `--radius-xl` | `16px` | Banner informasi lebar |
| `--radius-full`| `9999px` | Khusus avatar profil bulat |

*Anti-Pattern*: Dilarang menerapkan sudut membulat penuh (*pill*) pada tombol primer atau field input operasional industri.

---

## 15. Shadow System

```css
:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35);
  --shadow-dropdown: 0 16px 36px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  --shadow-modal: 0 24px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
```
*Aturan*: Dilarang menggunakan efek pendaran warna (*colored glow*) kecuali cincin fokus aksesibilitas transparan.

---

## 16. Elevation Hierarchy

```
Level 0: Base Page Canvas (z-index: 0)
Level 1: Card & Form Surface (z-index: 1)
Level 2: Raised Elements (Sticky Nav, Live Scale Bar) (z-index: 100)
Level 3: Active Toolbar Filter Layer (z-index: 1050)
Level 4: Floating Dropdowns & Autocomplete Menus (z-index: 10000)
Level 5: Modal Backdrop & Windows (z-index: 20000 / 20010)
Level 6: Toast Alerts & Micro Tooltips (z-index: 30000 / 40000)
```

---

## 17. Surface System

- **Page Base**: Latar belakang jendela aplikasi (`#0B1120`).
- **Section Block**: Area pengelompokan form (`#16243A` dengan border `#334155`).
- **Card**: Kartu ringkasan metrik dan kontainer tabel (`#16243A`).
- **Input Surface**: Kotak masukan teks dan tombol select trigger (`#16243A`, hover: `#1E2D44`).
- **Floating Surface**: Menu dropdown melayang dan popup datepicker (`#1E2D44` dengan border `#475569`).
- **Modal Surface**: Jendela dialog (`#16243A` berlatar belakang overlay gelap).

---

## 18. Buttons Specifications

### 18.1 Button Variants & Matrix
- **Primary (`.btn.btn-primary`)**: Background `#3671C6`, Teks `#FFFFFF`, Font Weight `600`, Border `transparent`. Hover: `#2563EB`, Active: `#1D4ED8`.
- **Secondary (`.btn.btn-secondary`)**: Background `#1E2D44`, Teks `#FFFFFF`, Font Weight `500`, Border `1px solid #334155`. Hover: `#2A3F5F`, Active: `#16243A`.
- **Danger (`.btn.btn-danger`)**: Background `#EF4444`, Teks `#FFFFFF`, Font Weight `600`. Hover: `#DC2626`.
- **Icon Button (`.btn-icon`)**: Background `transparent` (atau `#1E2D44`), padding seragam, menampilkan SVG tepat di tengah.

### 18.2 Dimensi Tombol
- **Standar**: Tinggi `38px`, padding `0 14px`, font size `13px`.
- **Kompak**: Tinggi `32px`, padding `0 10px`, font size `12px` (digunakan pada tabel aksi).

---

## 19. Form Controls Specifications

- **Tinggi Standar Input & Select**: Wajib tepat **`38px`** (`height: 38px !important; box-sizing: border-box;`).
- **Warna Teks Aktif**: Putih bersih (`#FFFFFF` dengan `-webkit-text-fill-color: #FFFFFF !important;`), Font Weight `500 Medium`, Font Size `13px`.
- **Warna Latar Belakang (Dark Mode)**: `#16243A` (Hover & Focus: `#1E2D44`).
- **Batas Tepi (Border)**: `1px solid #334155` (Hover/Focus: `var(--color-primary)`).
- **Padding Dalam**: `0 12px` (khusus combobox: `0 32px 0 12px` agar teks tidak tertimpa ikon panah).
- **Tata Letak Bilah Pencarian (`.search-box`)**: Field input pencarian tabel diposisikan di baris atas sejajar tepat di sebelah kiri tombol ekspor (`Export Excel (.xlsx)`) dengan teks placeholder seragam `"Masukkan kata kunci"`, dimensi responsif `width: clamp(200px, 18vw, 260px); height: 38px;`, tanpa tombol aksi Reset.
- **Tata Letak Baris Filter Tabel (`.table-toolbar`)**: Menggunakan pola distribusi flexbox terpisah (*split layout*):
  - **Sisi Kiri (`.table-filter-left`)**: Menampung kontrol filter spesifik modul (label `"Material:"` atau `"Pemasok:"` beserta dropdown masing-masing) menempel rapat di sisi paling kiri (*left-aligned*).
  - **Sisi Kanan (`.table-filter-right`)**: Menampung kontrol universal (pemilih `"Tanggal: dd/mm/yyyy"`, pengurutan `"Urutan:"`, dan jumlah baris `"Tampilkan:"`) yang didorong rapat ke sisi paling kanan (*right-aligned*) menggunakan `margin-left: auto !important; gap: 10px;`.
- **Tata Letak Input dengan Tombol Aksi (`.input-with-action`)**: Menggunakan kontainer flexbox dengan jarak pemisah horizontal presisi `gap: 8px` (`display: flex !important; gap: 8px !important; align-items: center !important;`). Komponen input unit mengadopsi `flex: 1 1 auto; min-width: 0;`, sedangkan tombol aksi seperti tombol Ambil berat (`.btn-action-capture`) mengadopsi `flex-shrink: 0; height: 38px; min-width: 80px; padding: 0 16px; margin: 0;`.

---

## 20. Form Layout & Field Ergonomics

- **Pola Label**: Diletakkan tepat di atas field input (*top-aligned*), `margin-bottom: 5px`.
- **Jarak Antar-Field Vertikal**: `16px`.
- **Jarak Antar-Kolom Form Horisontal**: `12px` s/d `16px`.
- **Indikator Wajib (*Required*)**: Asterisk merah menyala `<span class="required" style="color: #EF4444;">*</span>`.

---

## 21. Cards Component

- **Background**: `#16243A`.
- **Border**: `1px solid #334155`.
- **Radius**: `8px` s/d `10px`.
- **Padding**: `16px` s/d `20px`.
- **Header**: Memisahkan judul kartu (bobot 600) dengan area aksi kanan menggunakan Flexbox rata vertikal.

---

## 22. Navigation Bar System

- **Posisi**: Terletak di bawah bilah header atas aplikasi.
- **Tinggi**: `44px`.
- **Tab Item (`.nav-item`)**: Teks `13.5px`, Font Weight `500`, Warna `#94A3B8`.
- **Status Aktif (`.nav-item.active`)**: Teks `#FFFFFF`, Font Weight `600`, Latar `#16243A` membentang penuh tinggi baris (`height: 100%`), disertai garis bawah (*bottom indicator*) biru `#3671C6` setebal `3px` tanpa celah padding samping.

---

## 23. Header Bar Architecture

- **Tinggi**: `56px`.
- **Background**: `#0B1120`, Border Bawah: `1px solid #253347`.
- **Struktur**: Kiri memuat logo & wordmark, tengah memuat jam presisi operasional real-time format 24 jam dengan zona waktu WIB, kanan memuat indikator koneksi timbangan serial dan menu profil pengguna.

---

## 24. Footer Standards

- **Tata Letak**: Rata tengah atau kiri-kanan teratur di dasar viewport dokumen.
- **Tinggi**: `32px` s/d `40px`.
- **Teks**: `11.5px` s/d `12px`, warna `#64748B`, memuat versi aplikasi resmi, status koneksi database lokal SQLite, dan hak cipta korporasi.

---

## 25. Modals and Dialogs

- **Dimensi Lebar**: Konfirmasi kecil (`420px`), Formulir standar (`560px`), Transaksi luas (`800px` s/d `960px`).
- **Ketinggian Maksimum**: `90vh` dengan area bodi modal yang dapat di-scroll vertikal (`overflow-y: auto`).
- **Backdrop**: `rgba(11, 17, 32, 0.85)` dengan `backdrop-filter: blur(4px)`.
- **Interaksi Keyboard**: Tombol `Esc` wajib menutup modal, fokus keyboard terisolasi di dalam dialog (*focus trap*).

---

## 26. Dropdowns & Popovers

### 26.1 Penyelarasan Dropdown "Semua Pemasok" & "Semua Jenis Garam"
Seluruh tombol dropdown di bilah filter dan form wajib memiliki gaya visual yang **100% identik**:
- Tinggi: `38px`.
- Border: `1px solid #334155`.
- Background: `#16243A` (Hover/Focus: `#1E2D44`).
- Teks: `#FFFFFF`, Font Weight `500`, Font Size `13px`.
- Placeholder: `#FFFFFF` (opacity `1`, Font Weight `500`).

### 26.2 Sinkronisasi Lebar Menu Melayang
- Menu melayang (`.custom-select-menu`, `.custom-combobox-menu`) wajib terkunci tepat 100% sejajar dengan tombol pemicunya: `width: 100% !important; min-width: 100% !important; max-width: 100% !important; left: 0 !important; right: 0 !important; box-sizing: border-box !important;`.
- Max-height: `240px` s/d `280px` disertai scrollbar tipis. Jika ruang bawah layar sempit, terapkan kelas `.open-upward` untuk membuka menu ke arah atas.

---

## 27. Tables Component

- **Tinggi Header (`th`)**: `38px` s/d `40px`, warna teks `#94A3B8`, latar `#121E31`.
- **Tinggi Baris Data (`td`)**: `44px` s/d `48px`, warna teks `#FFFFFF`, padding `10px 14px`.
- **Border**: `1px solid #253347`.
- **Hover Baris**: `background-color: #1E2D44 !important; transition: background-color 0.15s ease;`.
- **Penyelarasan Kolom**: Rata kiri untuk teks nama/material, rata kanan untuk angka tonase timbangan dan nominal rupiah.

---

## 28. Lists Component

- **Standard List**: Jarak antar-item `8px`, garis pemisah tipis `1px solid #253347`.
- **Dense List**: Padding sel `6px 10px`, font size `12px` untuk riwayat log aktivitas.
- **Interaksi**: Item yang dapat diklik memiliki kursor `pointer` dan efek hover latar `#1E2D44`.

---

## 29. Tabs Component

- Tab bar menggunakan Flexbox horizontal tanpa wrapping.
- Status aktif memiliki highlight latar penuh dan garis bawah 3px tanpa celah spasi.
- Jika jumlah tab melebihi layar mobile, tab bar dapat di-scroll horizontal tanpa menampilkan scrollbar tebal.

---

## 30. Badges, Tags, & Status Chips

- **Tinggi**: `22px` s/d `24px`, padding `2px 8px`, border radius `4px`.
- **Tipografi**: `11px`, Font Weight `600 SemiBold`.
- **Kombinasi Warna Status**:
  - Lunas / Sukses: Latar `rgba(34, 197, 94, 0.15)`, Teks `#22C55E`.
  - Belum Lunas / Pending: Latar `rgba(245, 158, 11, 0.15)`, Teks `#F59E0B`.
  - Batal / Ditolak: Latar `rgba(239, 68, 68, 0.15)`, Teks `#EF4444`.

---

## 31. Icons Architecture

- Sumber: Set ikon SVG monokrom terpadu (Lucide / Feather SVG).
- Ketebalan Garis (*Stroke Width*): Konsisten `2px` (atau `1.75px` untuk ukuran > 20px).
- Skala Ukuran: `12px` (mikro), `14px` (tombol/tabel), `16px` (standar), `20px` (navigasi), `24px` (kartu stat utama).
- Dilarang keras mencampur gaya ikon (misal: menggabungkan ikon filled 3D dengan outline tipis).

---

## 32. Illustrations Policy

- **Kapan Boleh Dipakai**: Layar kosong (*empty state*), halaman error 404/500, atau panduan awal pertama kali sistem dipasang.
- **Kapan Dilarang**: Dilarang meletakkan ilustrasi di dalam formulir penimbangan aktif, tabel transaksi, atau bilah metrik operasional.
- **Gaya Visual**: Vektor datar monokromatik dengan aksen biru safir (`#3671C6`), garis tipis elegan, tanpa elemen kartun berlebihan.

---

## 33. Photography Standards

- Foto armada truk, fasilitas tambak garam, atau profil karyawan wajib menggunakan pencahayaan natural yang tajam.
- Rasio sudut kartu foto: `radius-sm` (4px).
- Dilarang menggunakan foto stok generik yang terlihat tidak realistis untuk konteks operasional industri Indonesia.

---

## 34. Image Aspect Ratios

- **Foto Armada / Dokumen**: `16:9` atau `4:3` dengan `object-fit: cover`.
- **Avatar Pengguna**: `1:1` (lingkaran penuh `50%` radius).
- **Banner Header**: `3:1` atau `4:1`.

---

## 35. Motion & Animation System

- **Durasi Fast**: `150ms` (hover tombol, border input, transisi warna teks).
- **Durasi Normal**: `200ms` (dropdown buka/tutup, modal dialog fade-in).
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (*standard industrial curve*).
- **Reduced Motion**: Kepatuhan penuh pada `prefers-reduced-motion: reduce` dengan menonaktifkan seluruh durasi animasi.

---

## 36. Hover System Rules

- Hover pada tombol: Perubahan warna latar belakang satu tingkat lebih cerah (`#3671C6` -> `#2563EB`).
- Hover pada baris tabel: Latar belakang berubah menjadi `#1E2D44`.
- **Aturan Mutlak**: Dilarang menggunakan pembesaran skala (`transform: scale(...)`) pada tombol atau baris tabel yang dapat mengubah tata letak elemen di sekitarnya.

---

## 37. Focus States Architecture

- Setiap elemen interaktif yang menerima fokus melalui tombol keyboard wajib menampilkan cincin fokus:
  `outline: none; box-shadow: 0 0 0 2px rgba(54, 113, 198, 0.4), 0 0 0 4px rgba(11, 17, 32, 1);`.
- Dilarang menghapus selektor `:focus-visible` dari stylesheet aplikasi.

---

## 38. Active / Pressed States

- Tombol yang ditekan memberikan respon taktil berupa pergeseran ke bawah sebesar 1 piksel (`transform: translateY(1px);`) dan warna latar sedikit lebih gelap.
- Tab navigasi terpilih mengunci warna latar `#16243A` secara permanen.

---

## 39. Disabled States

- Elemen non-aktif menggunakan `opacity: 0.5; cursor: not-allowed !important; pointer-events: none;`.
- Warna latar tombol non-aktif menggunakan `#253347` dengan warna teks abu-abu redup `#64748B`.
- Aksesibilitas: Dilarang hanya mengandalkan warna redup tanpa menyertakan atribut HTML `disabled` atau `aria-disabled="true"`.

---

## 40. Loading States

- Tombol yang sedang memproses data menampilkan animasi spinner SVG berputar (16px) yang menggantikan ikon atau teks, dengan lebar tombol terkunci stabil (*no layout jump*).
- Tabel yang memuat data menampilkan baris skeleton shimmer redup berlatar `#1E2D44`.

---

## 41. Empty States

- Saat tabel atau modul pencarian tidak menemukan data: Tampilkan ikon outline netral (32px), teks judul informatif (`"Tidak Ada Data Ditemukan"`), deskripsi saran pencarian, dan tombol aksi pemulihan ("Reset Filter").

---

## 42. Error States

- Validasi form error: Border input berubah menjadi `#EF4444`, muncul pesan kesalahan spesifik di bawah input setinggi 12px dengan ikon seru.
- Notifikasi kesalahan sistem: Nada pesan harus tenang, objektif, dan memberikan solusi ("Koneksi timbangan serial terputus. Periksa kabel RS232 atau klik Hubungkan Kembali.").

---

## 43. Success States

- Transaksi tersimpan atau pencetakan berhasil memberikan feedback instan berupa pesan toast mengambang berlatar gelap dengan aksen hijau `#22C55E` yang hilang otomatis setelah 3 detik.

---

## 44. Notifications System

- **Toast Notifications**: Terletak di sudut kanan bawah (`bottom: 24px; right: 24px;`), z-index `30000`, lebar `360px`, durasi tayang 3 hingga 5 detik, otomatis jeda saat kursor mouse berada di atasnya (*pause on hover*).
- **Inline Alert Banner**: Terletak di bagian atas formulir untuk pemberitahuan pemeliharaan sistem atau peringatan batch data.

---

## 45. Tooltips Standards

- Waktu tunda kemunculan: `300ms` hover delay untuk mencegah kedipan visual saat kursor melintas cepat.
- Dimensi: Maksimal lebar `240px`, padding `6px 10px`, radius `4px`, background `#1E2D44`, border `1px solid #475569`, font size `11.5px`, teks `#FFFFFF`.

---

## 46. Cursor Behavior

- Elemen interaktif (tombol, tab, opsi select, checkbox, tautan): `cursor: pointer;`.
- Field input teks: `cursor: text;`.
- Elemen non-aktif: `cursor: not-allowed;`.
- Dilarang membuat kursor kustom berbasis grafis yang memperlambat respon pointer sistem operasi.

---

## 47. Scroll Behavior

- Scrolling halaman menggunakan scrolling native yang dioptimalkan perangkat keras (`scroll-behavior: smooth;`).
- Scrollbar kustom tipis berukuran `6px` dengan track transparan dan thumb berwarna `#334155` (hover: `#475569`).
- Dilarang menerapkan pembajakan scroll (*scroll hijacking*) yang mengubah akselerasi scroll roda mouse.

---

## 48. Accessibility (WCAG 2.1 AA)

- Seluruh pasangan warna teks dan latar belakang wajib memiliki rasio kontras minimal **4.5:1** untuk teks standar dan **3.0:1** untuk komponen antarmuka grafis.
- Target sentuh interaktif minimal `32px` untuk mouse desktop dan `44×44px` untuk layar sentuh tablet.
- Struktur heading dokumen semantik teratur (`h1` tunggal per halaman, diikuti `h2` dan `h3` secara berjenjang).

---

## 49. Content Design & Copywriting Standards

- **Bahasa**: Bahasa Indonesia baku, formal, dan konsisten di seluruh aplikasi.
- **Teks Tombol**: Gunakan kata kerja tindakan spesifik ("Simpan Transaksi", "Cetak Nota", "Export Excel", bukan "OK" atau "Kirim").
- **Teks Label**: Singkat dan jelas dengan tanda titik dua di akhir pada bilah filter toolbar (`Material:`, `Pemasok:`, `Tanggal:`).
- **Placeholder**: Mengindikasikan panduan instruksi pengisian standar ("Masukkan nomor polisi kendaraan", "Masukkan nama supir", "Masukkan nama petugas timbang", "Tambahkan catatan transaksi (Opsional)", "Semua Pemasok"). Dilarang menggunakan mock/dummy sample values sebagai teks placeholder.

---

## 50. Number & Data Formatting Standards

- **Mata Uang**: Format Rupiah baku dengan spasi dan pemisah ribuan titik: `Rp 45.430.600`.
- **Berat Timbangan**: Disertai satuan `Kg` dan pemisah ribuan titik: `37.896 Kg`.
- **Rata Kanan (Right-Aligned)**: Seluruh angka keuangan dan berat pada kolom tabel wajib rata kanan dengan font monospace.

---

## 51. Date & Time Formatting Standards

- Format Tanggal: `DD/MM/YYYY` (contoh: `28/09/2026`) atau format panjang `28 Sep 2026`.
- Format Waktu: 24 jam dengan penanda zona waktu resmi: `14:30:00 WIB`.
- Timestamp Penyimpanan: ISO-8601 (`YYYY-MM-DD HH:mm:ss`).

---

## 52. Data Visualization Standards

- Grafik garis tren dan bar chart menggunakan palet warna semantik yang kontras di atas kanvas gelap (`#38BDF8` untuk K1, `#F59E0B` untuk K2, `#3671C6` untuk Garam Curah, `#22C55E` untuk Garam Karung).
- Tooltip grafik: Kartu melayang berlatar `#16243A` dengan border `#334155` yang menampilkan rincian angka berat dan rupiah secara presisi.

---

## 53. Responsive Component Behavior

- **Bilah Filter Toolbar**: Pada layar desktop lebar tampil satu baris horizontal lurus. Pada layar yang menyempit, bilah filter mengizinkan pembungkusan baris (*wrap*) secara teratur tanpa memotong teks label atau mendistorsi ukuran dropdown.
- **Tabel Data**: Memiliki pembungkus scroll horizontal otomatis dengan proteksi lebar minimum kolom agar data sel tidak terhimpit.

---

## 54. Component Anatomy Standards

Setiap komponen inti wajib mematuhi anatomi standar:
1. **Button**: Kontainer tombol, ikon kiri (opsional), teks label berbobot 600, spinner loading (kondisional), ring fokus tersembunyi yang aktif saat keyboard fokus.
2. **Form Field**: Label statis di bagian atas, penanda bintang required, kotak input berketinggian 38px, ikon aksi/panah di kanan, teks pesan error di bawah.
3. **Dropdown Combobox**: Kontainer luar, input teks pemicu, tombol panah chevron SVG kanan berputar, menu kartu melayang dengan batas z-index 10000.

---

## 55. Design Tokens Master Reference

```css
:root {
  /* Color Tokens */
  --color-primary: #3671C6;
  --color-primary-hover: #2563EB;
  --color-bg-base: #0B1120;
  --color-bg-surface: #16243A;
  --color-bg-surface-elevated: #1E2D44;
  --color-border-default: #334155;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #94A3B8;

  /* Sizing Tokens */
  --input-height-standard: 38px;
  --btn-height-standard: 38px;
  --btn-height-sm: 32px;
  --header-height: 56px;
  --nav-height: 44px;

  /* Spacing Tokens */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius Tokens */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Z-Index Tokens */
  --z-nav: 100;
  --z-toolbar-open: 1050;
  --z-dropdown: 10000;
  --z-modal-backdrop: 20000;
  --z-modal: 20010;
  --z-toast: 30000;
}
```

---

## 56. Token Naming Convention

Format penamaan variabel token menggunakan konvensi BEM-like kebab-case:
`--[kategori]-[properti]-[elemen/varian]-[status]`
- Contoh Warna: `--color-bg-surface`, `--color-border-focus`, `--color-text-primary`.
- Contoh Ukuran: `--btn-height-standard`, `--input-height-compact`.
- Contoh Spasi: `--space-2`, `--space-4`, `--space-8`.

---

## 57. CSS Architecture

Hierarki struktur pemanggilan stylesheet:
1. `reset.css`: Normalisasi box-sizing, margin nol, dan typography rendering.
2. `tokens.css` / `:root`: Definisi seluruh custom properties design system.
3. `typography.css`: Skala font, font-family, heading, dan format monospace.
4. `layout.css`: Header, navbar, main container, dan grid system.
5. `components.css`: Tombol, input, custom-select, custom-combobox, tabel, kartu, modal.
6. `dark-mode.css`: Penyelarasan tema gelap tingkat lanjut.
7. `responsive.css`: Aturan adaptasi layar dan breakpoint query.
8. `print.css`: Format cetak nota tiket fisik dot-matrix/thermal.

---

## 58. Component Architecture

- Menggunakan pendekatan modular atomik (Atoms -> Molecules -> Organisms).
- Setiap komponen HTML memiliki kelas CSS semantik independen (`.custom-combobox`, `.table-filter-group`).
- Hindari penulisan inline style sembarangan; gunakan variabel token untuk seluruh properti berulang.

---

## 59. Theme System

- Sistem mendukung dua tema: **Dark Mode (Default Utama)** dan **Light Mode (Mode Terang Kontras Tinggi)**.
- Transisi antar-tema dilakukan secara instan melalui penambahan kelas `.dark-mode` pada elemen root `<html>` dan `<body>`.
- Seluruh variabel semantik berganti nilai secara otomatis tanpa merusak tata letak.

---

## 60. Dark Mode Rules

- Latar kanvas dasar: `#0B1120`.
- Kartu dan panel form: `#16243A` dengan border `#334155`.
- Permukaan tombol melayang dan hover baris tabel: `#1E2D44`.
- Teks utama: Putih terang `#FFFFFF` berkontras tinggi.
- Seluruh tombol dropdown pemicu memiliki latar `#16243A` dengan border `#334155` dan teks `#FFFFFF` (bobot 500).

---

## 61. Light Mode Rules

- Latar kanvas dasar: `#F8FAFC`.
- Kartu dan panel form: `#FFFFFF` dengan border `#E2E8F0`.
- Hover baris tabel: `#F1F5F9`.
- Teks utama: Abu-abu arang pekat `#0F172A`.
- Menjaga kesetaraan fungsional 1:1 dengan tema gelap.

---

## 62. Overlay & Layering Architecture

- Menghindari pemotongan konten (*clipping*): Kontainer kartu yang memuat menu dropdown tidak boleh memiliki aturan `overflow: hidden` saat menu dropdown sedang dalam status terbuka (`.open`).
- Elemen floating popover selalu diposisikan secara absolut dengan z-index `10000`.

---

## 63. Z-Index Scale

```
0     : Dasar Halaman (Canvas)
1     : Komponen Standar (Card, Table, Form)
100   : Sticky Application Header & Navigation Bar
1050  : Bilah Filter Tabel saat Dropdown Terbuka
10000 : Menu Dropdown Melayang (Custom Select & Combobox)
20000 : Latar Gelap Modal (Backdrop Overlay)
20010 : Jendela Dialog Modal
30000 : Notifikasi Toast
40000 : Tooltip Instan
```

---

## 64. Page Templates

1. **Login Page Template**: Form login terpusat simetris di tengah layar dengan background tenang dan fokus kredensial.
2. **Dashboard Overview Template**: Bilah live scale di bagian atas, 4 kartu metrik KPI, area visualisasi grafik analitik, dan tabel transaksi terkini.
3. **Transaction Form Template (Nota Timbang)**: Pembagian dua kolom (informasi dokumen di kiri, rincian timbangan dan perhitungan subtotal di kanan).
4. **Data Archive Template (Riwayat)**: Toolbar pencarian dan filter di atas, tabel data responsif berdensitas tinggi, dan bilah kontrol pagination di bawah.

---

## 65. Login Page Rules (Khusus NexaWorks & RCG)

1. **Max Form Width**: Wajib maksimal **`420px`**, terpusat secara vertikal dan horizontal di tengah viewport.
2. **Headline Size**: `24px` s/d `28px` SemiBold dengan subjudul sistem yang jelas dan tenang.
3. **Brand Placement**: Logo resmi perusahaan diletakkan di bagian atas kartu form dengan padding bawah terukur.
4. **Input Height**: `42px` s/d `44px` untuk kenyamanan entri kredensial pertama kali.
5. **CTA Behavior**: Tombol submit utama selebar 100% dengan indikator loading spinner saat proses otentikasi.
6. **Technical Metadata**: Versi rilis sistem dan hak cipta diletakkan di dasar layar secara diskret (`#64748B`).
7. **What Must Be Removed**: Dilarang menggunakan ilustrasi dekoratif 3D mengambang, efek partikel canvas, atau animasi berputar yang membebani CPU.

---

## 66. Dashboard Layout Architecture

- **Top Bar**: Bilah indikator timbangan berat real-time (`#main-scale-card`) dengan indikasi status koneksi stabil.
- **KPI Grid**: 4 Kartu metrik (Total Transaksi, Total Berat Bersih, Total Pembayaran, Transaksi Hari Ini) menggunakan font monospace tabular untuk angka.
- **Main Operational Area**: Modul aktif yang terpilih melalui tab navigasi utama.

---

## 67. Page-Level Spacing Standards

- Padding atas halaman: `20px` s/d `24px`.
- Jarak antar-seksi modul: `24px` s/d `32px`.
- Padding bawah halaman: `32px` s/d `48px`.
- Gutter samping layar: `24px` (desktop), `16px` (laptop/tablet).

---

## 68. Interaction Philosophy

- Seluruh aksi tombol harus memberikan umpan balik visual seketika dalam waktu < 100ms.
- Dilarang membuat animasi atau efek hover yang mengubah posisi atau mendistorsi tata letak elemen di dekatnya.
- Alur kerja dirancang untuk kecepatan operator, bukan keindahan pasif.

---

## 69. Performance Rules

- Seluruh font web dimuat dengan strategi `font-display: swap;`.
- Menggunakan ikon vektor SVG murni tanpa ketergantungan library font-icon eksternal yang besar.
- Transisi animasi hanya diizinkan untuk properti `transform` dan `opacity`.
- Menghindari layout shift (CLS = 0) dengan mengunci dimensi tombol dan kontainer gambar.

---

## 70. AI-Slop Prevention Rules (Aturan Mutlak Anti-Dekorasi Artifisial)

1. Jangan gunakan gradasi warna tanpa tujuan informatif yang jelas.
2. Jangan gunakan efek pendaran neon (*glowing boxes*) secara sembarangan.
3. Jangan membuat seluruh sudut kartu membulat ekstrem (*avoid universal pills*).
4. Jangan gunakan efek glassmorphism berlebihan yang mengorbankan kontras teks.
5. Jangan memenuhi antarmuka dengan metadata teknis tiruan atau teks palsu.
6. Jangan menyematkan ikon dekoratif yang tidak memiliki fungsi atau arti data.
7. Jangan membuat tombol berukuran terlalu besar yang membuang ruang kerja.
8. Jangan membuat whitespace kosong tanpa struktur yang proporsional.
9. Jangan menggunakan skala pembesaran besar (*scale up*) pada efek hover tombol.
10. Jangan menggunakan font tulisan tangan atau serif miring (*italic serif*) dekoratif.
11. Jangan gunakan garis grid latar belakang yang terlalu kentara.
12. Jangan meniru tema cyberpunk atau terminal fiktif pada aplikasi enterprise.
13. Jangan menggunakan nilai margin/padding arbitrer di luar skala token 4px.
14. Jangan mencampur set ikon dengan ketebalan garis yang berbeda-beda.
15. Jangan membiarkan label form terpotong atau tertimpa oleh field dropdown di sebelahnya.
16. Jangan membuat komponen baru jika pola komponen reusable sudah tersedia di sistem.
17. Jangan mengubah bahasa antarmuka secara acak; pertahankan konsistensi Bahasa Indonesia baku.
18. Selalu perlakukan dokumen `DESIGN_SYSTEM.md` ini sebagai sumber kebenaran tertinggi (*highest source of truth*).

---

## 71. Visual QA Checklist

Sebelum sebuah perubahan antarmuka dinyatakan lulus inspeksi:
- [ ] Penyelarasan visual konsisten dengan grid dan skala spasi 4px.
- [ ] Jarak antara teks label statis dan dropdown tepat 8px (`gap: 8px`).
- [ ] Label teks terbaca 100% utuh tanpa tertimpa atau terpotong pada resolusi 1024px dan 1366px.
- [ ] Tombol "Semua Pemasok" memiliki warna teks aktif putih terang (`#FFFFFF`), bobot font 500, tinggi 38px, dan border yang persis sama dengan "Semua Jenis Garam".
- [ ] Lebar menu dropdown melayang tepat 100% sinkron mengikuti lebar tombol pemicunya.
- [ ] Garis bawah tab navigasi aktif terbentang 100% penuh tanpa celah margin samping.
- [ ] Seluruh antarmuka 100% bebas dari karakter emoji dekoratif.

---

## 72. Accessibility QA Checklist

- [ ] Seluruh elemen interaktif dapat dijangkau dan dioperasikan menggunakan tombol `Tab`, `Enter`, dan `Space`.
- [ ] Indikator cincin fokus terlihat jelas dengan kontras memadai saat navigasi keyboard aktif.
- [ ] Rasio kontras teks terhadap latar belakang memenuhi standar WCAG AA (minimal 4.5:1).
- [ ] Seluruh kontrol form memiliki label yang terhubung secara semantik atau atribut `aria-label`.
- [ ] Sistem mematuhi preferensi sistem operasi `prefers-reduced-motion`.

---

## 73. Responsive QA Checklist

Uji verifikasi tata letak minimal pada resolusi:
- [ ] `1024 × 768` (Layar laptop kecil & stasiun timbang industri).
- [ ] `1280 × 800` (Layar standar komersial).
- [ ] `1366 × 768` (Resolusi target utama operasional desktop).
- [ ] `1600 × 900` (Resolusi desktop menengah).
- [ ] `1920 × 1080` (Layar kerja Full HD).
- [ ] Tablet (768px portrait & landscape) untuk modul rekapitulasi.

---

## 74. Implementation Checklist

- [ ] Kode menggunakan custom properties dari `:root` (tanpa nilai hex atau margin sembarangan).
- [ ] Tidak ada aturan CSS inline `style="..."` kecuali nilai dinamis yang dihitung oleh JavaScript.
- [ ] Komponen menggunakan kelas semantik standar (`.custom-select`, `.custom-combobox`, `.table-filter-group`).
- [ ] Format angka uang menggunakan format rupiah baku dan berat menggunakan satuan Kg.

---

## 75. Do / Don’t Summary Examples

| Area Desain | Praktik yang Benar (DO) | Pelanggaran yang Dilarang (DON'T) |
| :--- | :--- | :--- |
| **Tipografi** | Plus Jakarta Sans untuk teks UI, JetBrains Mono untuk angka data | Mencampur font serif dekoratif atau font tulisan tangan |
| **Bilah Filter** | Berikan `gap: 8px` dan `flex-shrink: 0` pada label statis | Membiarkan label menciut hingga tertimpa kotak input |
| **Dropdown** | Samakan styling input combobox dengan tombol select trigger | Membiarkan combobox terlihat abu-abu redup menyerupai field mati |
| **Warna** | Gunakan warna semantik hijau/kuning/merah hanya untuk status | Menggunakan warna merah atau hijau untuk tombol dekoratif biasa |
| **Interaksi** | Respon hover halus dengan perubahan warna latar (150ms) | Menggunakan animasi memantul (*bouncy*) yang lambat |
| **Ikon** | Gunakan ikon vektor SVG monokrom bergaris tipis 2px | Memakai emoji berwarna-warni atau ikon bitmap resolusi rendah |

---

## 76. Reference Screens & Naming Conventions

- Tangkapan layar referensi disimpan pada direktori dokumentasi dengan konvensi:
  `ui-[modul]-[tema]-[resolusi].png`
  Contoh: `ui-riwayat-dark-1366x768.png`, `ui-login-dark-1366x768.png`.
- Setiap tangkapan layar wajib memperlihatkan antarmuka bersih tanpa artefak rendering atau elemen terpotong.

---

## 77. Versioning Policy

- Sistem menggunakan Semantic Versioning: `MAJOR.MINOR.PATCH` (contoh: `2.0.0`).
  - **MAJOR**: Perubahan arsitektur warna dasar, penggantian font inti, atau perombakan sistem grid.
  - **MINOR**: Penambahan komponen baru atau penyesuaian fungsionalitas komponen tanpa merusak antarmuka lama.
  - **PATCH**: Perbaikan bug visual minor (seperti perbaikan jarak gap 8px atau penyelarasan warna teks).

---

## 78. Governance & Review Process

- Setiap penambahan token baru atau perubahan styling global wajib melalui peninjauan kode (*pull request review*) oleh Lead UI/UX Engineer dan Core System Architect.
- Pengembang dilarang mengubah variabel desain secara sepihak di stylesheet lokal modul tertentu.

---

## 79. Deprecation Rules

- Komponen yang dinyatakan usang (*deprecated*) diberikan penanda `@deprecated` dalam kode dan dokumentasi.
- Komponen usang dipertahankan selama 1 siklus versi minor untuk memberikan masa transisi migrasi sebelum dihapus permanen pada rilis versi major berikutnya.

---

## 80. Final Design Contract for AI Assistants

Dokumen ini merupakan kontrak kerja mutlak (*immutable design contract*) untuk setiap AI Coding Assistant yang bekerja pada basis kode RCG dan NexaWorks:

1. **AI Wajib Mematuhi Token Desain**: AI dilarang keras menciptakan nilai warna hex baru, margin acak, atau ukuran font di luar spesifikasi file ini.
2. **AI Wajib Memelihara Konsistensi Komponen**: Setiap kali membuat atau memodifikasi bilah filter, dropdown, form, atau tabel, AI wajib menyelaraskan kelas dan styling-nya dengan komponen referensi yang telah divalidasi.
3. **AI Dilarang Menyisipkan "AI-Slop"**: Setiap baris kode CSS atau HTML yang dihasilkan harus fungsional, bersih, semantik, berkinerja tinggi, dan berorientasi pada kebutuhan pengguna industri nyata.
4. **AI Wajib Menguji Responsivitas**: AI wajib memastikan label tidak tertumpuk (*zero overlap*) dan dropdown memiliki gap yang aman minimal 8px di seluruh resolusi target.
5. **Dokumen Ini Adalah Dokumen Tertinggi**: Jika terdapat pertentangan antara asumsi umum AI dengan aturan dalam `DESIGN_SYSTEM.md`, maka aturan dalam **`DESIGN_SYSTEM.md` adalah yang selalu dimenangkan dan diterapkan secara mutlak**.
