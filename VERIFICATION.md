**Verifikasi implementasi — 13 Oktober 2026**

Seluruh kartu Panitia dan Peserta berbentuk portrait dengan lebar 5,5 cm × tinggi 8,5 cm. Area foto 4 × 6 cm dipertahankan, dengan dua label ringkas di bawahnya. Build produksi berhasil dan seluruh delapan tes browser versi final ini lulus pada 13 Oktober 2026. Pemeriksaan visual PNG dan screenshot memastikan susunan foto, logo, serta label berada di dalam kartu.

Cakupan pengujian yang lulus untuk ukuran terbaru:

- Empat skenario pada Chrome desktop dan empat pada Chrome dengan viewport ponsel Pixel 7.
- Dimensi PNG 650 × 1004 px, diperiksa langsung dari header file.
- Satu pHYs chunk 300 DPI yang valid, termasuk CRC. Lebar dan tinggi fisik dihitung dari dimensi PNG dan pHYs, dengan toleransi kurang dari 0,01 cm terhadap 5,5 × 8,5 cm.
- Area foto tetap 4 × 6 cm dengan rasio 2:3 sesuai permintaan pengguna sebelumnya, berada sepenuhnya di dalam kartu portrait.
- Unduhan tanpa foto dan tanpa placeholder foto pada hasil.
- Nama dan Jabatan/Pangkalan mixed case dirender UPPERCASE pada Canvas hasil ekspor.
- Tab Peserta menampilkan Nama dan Pangkalan tanpa input Jabatan.
- Pergantian cepat Peserta → Panitia saat aset Peserta diperlambat tetap menghasilkan template yang benar.
- Navigasi tab dengan keyboard; Jabatan dan Pangkalan tetap terpisah saat tab diganti.
- Nama/foto dipertahankan saat tab diganti; Reset membersihkan data sambil mempertahankan pilihan tab.
- Label Nama Peserta memakai #B91C1C dan Pangkalan memakai #991B1B, dengan teks putih.
- Pixel PNG yang diunduh sama dengan pixel preview.
- Zoom dan posisi crop dengan keyboard mengubah preview sebelum tombol panah dilepas.
- Nama/Jabatan/Pangkalan yang tidak muat serta input kosong menonaktifkan unduhan.
- File PNG tidak valid dan foto di atas 10 MB ditolak dengan pesan yang jelas.
- Tidak ada request upload/POST pada skenario membuat dan mengunduh kartu.
- Lebar halaman tidak melebihi viewport pada desktop dan ponsel yang diuji.
- Screenshot awal dan setelah unduh tersedia untuk pemeriksaan visual susunan portrait.

Browser pengujian menggunakan Chrome lokal dengan emulasi viewport ponsel. Safari/iOS fisik dan hasil cetak fisik belum diuji.

Aset portrait digambar melalui Canvas dengan rasio asli dan potongan tepi seperlunya agar logo tetap proporsional pada ukuran kartu terbaru. Template Panitia menggunakan rekonstruksi imagegen, dengan keterbatasan yang dicatat di ASSET-NOTES.md. File sumber template Peserta tetap merupakan salinan persis aset kosong pengguna. Pengguna telah mengizinkan pengunggahan source dan aset template untuk publikasi privat melalui Sites. Aplikasi tetap memproses data dan foto di browser.
