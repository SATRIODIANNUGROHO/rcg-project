# Aturan Wajib Kompilasi Executable (.EXE)

1. **Selalu Terapkan Perbaikan & Pembaruan ke .EXE**:
   - Setiap kali menyelesaikan perbaikan atau pembaruan kode (tata letak, logika, styling, dokumen, fitur), selalu jalankan kompilasi ulang berkas executable Windows (`npm run dist`).

2. **Wajib Jalankan Taskkill Sebelum `npm run dist`**:
   - Sebelum menjalankan `npm run dist`, SELALU hentikan proses aplikasi yang sedang berjalan untuk mencegah error file lock (`EBUSY: resource busy or locked`).
   - Gunakan perintah:
     ```powershell
     try { taskkill /F /IM "RCG Salt Weighing System.exe" /T } catch {}; try { taskkill /F /IM "electron.exe" /T } catch {}; npm run dist
     ```
