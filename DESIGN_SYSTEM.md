# PT. Reka Cipta Garam - Design System & UI Guidelines

Dokumen acuan resmi (*baseline source of truth*) untuk desain antarmuka, tata letak, warna, tipografi, dan komponen aplikasi **Salt Weighing System v7.5.0**.

---

## 1. Color Palette

Pendekatan: **Dark Professional / Industrial Dashboard**.

### Primary Palette

| Warna | Hex | Fungsi | Rasio Visual |
| :--- | :--- | :--- | :---: |
| **Primary Blue** | `#3671C6` | Primary action, button aktif, link, highlight utama | **10%** |
| **Deep Dark Blue** | `#0B1120` | Background aplikasi utama & area navigasi | **35%** |
| **Surface Navy** | `#16243A` | Card, table body, panel container | **25%** |
| **Light Surface** | `#1E2D44` | Hover state, table striping, secondary surface | **10%** |
| **White** | `#F5F7FA` | Text utama, judul tabel, angka metrik penting | **10%** |
| **Muted Gray** | `#AAB4C3` | Secondary text, label input, deskripsi | **5%** |
| **Border Gray** | `#334155` | Border card, garis pembatas tabel, divider | **3%** |
| **Status Colors** | — | Indikator status & feedback operasional | **2%** |

### Status Colors

- **Success (`#22C55E`)**: Status Lunas, Koneksi Timbangan Aktif, Berhasil Disimpan.
- **Warning (`#F59E0B`)**: Status Belum Lunas, Pending, Peringatan Sistem.
- **Error (`#EF4444`)**: Gagal, Error, Hapus / Destructive Action.
- **Info (`#38BDF8`)**: Informasi, Tautan Bantuan, Highlight Sekunder.

### Aturan Warna
- **Blue (`#3671C6`)** adalah warna identitas dan aksi utama.
- Warna status hijau, kuning, dan merah **hanya** dipakai untuk status atau feedback, bukan dekorasi bebas.
- Text utama wajib memiliki kontras tinggi (`#F5F7FA`).

---

## 2. Typography

| Kategori | Font Family | Porsi Penggunaan | Peruntukan |
| :--- | :--- | :---: | :--- |
| **Font Utama** | **Plus Jakarta Sans** | **90–95%** | Heading, Body, Navigasi, Tombol, Tabel, Form, Modal, Notifikasi |
| **Font Monospace** | **JetBrains Mono** / **IBM Plex Mono** | **5–10%** | No. Dokumen, Nilai Timbangan (Kg), Jam & Tanggal, Nilai Rupiah |

---

## 3. Font Size & Hierarchy

| Elemen | Skala Ukuran | Weight |
| :--- | :---: | :--- |
| Display / Hero Metric | `28–32px` | `700 Bold` |
| Heading 1 (H1) | `24–28px` | `700 Bold` |
| Heading 2 (H2) | `20–24px` | `600 SemiBold` |
| Heading 3 (H3) | `18–20px` | `600 SemiBold` |
| Body Large | `16px` | `400 / 500` |
| Body Default | `14–15px` | `400 Regular` |
| Body Small / Helper | `13px` | `400 / 500` |
| Caption & Badge | `12px` | `600 SemiBold` |
| Button Text | `14px` | `600 SemiBold` |
| Table Header / Body | `13–14px` | `600 Header / 400 Body` |
| Form Input | `14px` | `400 Regular` |

---

## 4. Spacing Scale

Gunakan kelipatan terstandarisasi:
`4px` · `8px` · `12px` · `16px` · `24px` · `32px` · `40px` · `48px` · `64px`

- **Icon ↔ Text**: `8px`
- **Internal Input Padding**: `10px 14px`
- **Antar Form Field**: `16px`
- **Antar Card / Section**: `24–32px`
- **Page Container Padding**: `24–32px`

---

## 5. Corner Radius

> *"Sharp enough to look professional, rounded enough to feel modern."*

| Komponen | Radius Standar |
| :--- | :---: |
| Button | `6–8px` |
| Input & Select | `6–8px` |
| Card & Container | `8–12px` |
| Modal & Dialog | `12px` |
| Dropdown Menu | `8px` |
| Status Badge | `6px` |
| Table Container | `8–10px` |
| Avatar | `50%` |

---

## 6. Icons & Language Consistency

- **Zero Emojis**: Dilarang menggunakan emoji atau karakter Unicode dekoratif sebagai ikon antarmuka.
- **Unified Vector Icons**: Menggunakan set ikon SVG standar industri yang konsisten ukuran (`16–20px`) dan ketebalan garisnya.
- **Konsistensi Bahasa**: Menggunakan **Bahasa Indonesia** baku dan profesional secara seragam di seluruh menu, tombol, modal, placeholder, dan pesan notifikasi sistem.

---

## 7. Master Principle

> **"Setiap elemen UI harus memiliki alasan keberadaan, fungsi yang jelas, hierarchy visual yang tepat, dan konsisten dengan design system aplikasi."**
