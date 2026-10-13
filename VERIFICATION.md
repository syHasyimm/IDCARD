**Verifikasi implementasi — 13 Oktober 2026**

Seluruh kartu Panitia dan Peserta berbentuk portrait dengan lebar 5,5 cm × tinggi 8,5 cm. Area foto kedua jenis kartu berukuran 3 × 4 cm dengan rasio crop 3:4. Unduhan memakai JPG saja. Build produksi dan seluruh delapan tes browser ukuran foto terbaru lulus pada 13 Oktober 2026; hasil JPG juga diperiksa secara visual.

Cakupan pengujian yang lulus untuk ukuran foto terbaru:

- Empat skenario pada Chrome desktop dan empat pada Chrome dengan viewport ponsel Pixel 7.
- Signature JPEG SOI/EOI dan dimensi JPG 650 × 1004 px, diperiksa langsung dari header SOF file.
- Satu segmen JFIF APP0 dengan unit inci dan densitas horizontal/vertikal 300 DPI. Lebar dan tinggi fisik dihitung dari dimensi JPG dan densitas tersebut, dengan toleransi kurang dari 0,01 cm terhadap 5,5 × 8,5 cm.
- Area foto Panitia dan Peserta 3 × 4 cm dengan rasio 3:4, berada sepenuhnya di dalam kartu portrait.
- Unduhan tanpa foto dan tanpa placeholder foto pada hasil.
- Nama dan Jabatan/Pangkalan mixed case dirender UPPERCASE pada Canvas hasil ekspor.
- Tab Peserta menampilkan Nama dan Pangkalan tanpa input Jabatan.
- Pergantian cepat Peserta → Panitia saat aset Peserta diperlambat tetap menghasilkan template yang benar.
- Navigasi tab dengan keyboard; Jabatan dan Pangkalan tetap terpisah saat tab diganti.
- Nama/foto dipertahankan saat tab diganti; Reset membersihkan data sambil mempertahankan pilihan tab.
- Label Nama Peserta memakai #B91C1C dan Pangkalan memakai #991B1B, dengan teks putih.
- Pixel JPG yang diunduh sama dengan hasil preview yang dienkode JPEG pada kualitas 95%, setelah kedua gambar didekode. Preview mentah dan JPG tidak dituntut identik karena JPEG memakai kompresi lossy.
- Zoom dan posisi crop dengan keyboard mengubah preview sebelum tombol panah dilepas.
- Nama/Jabatan/Pangkalan yang tidak muat serta input kosong menonaktifkan unduhan.
- File PNG tidak valid dan foto di atas 10 MB ditolak dengan pesan yang jelas.
- Tidak ada request upload/POST pada skenario membuat dan mengunduh kartu.
- Pemeriksaan tambahan berhasil untuk pembaruan metadata JFIF yang sudah ada serta penyisipan JFIF jika tidak tersedia; byte kompresi gambar dipertahankan tanpa encoding ulang.
- Lebar halaman tidak melebihi viewport pada desktop dan ponsel yang diuji.
- Screenshot awal dan setelah unduh tersedia untuk pemeriksaan visual susunan portrait.

Browser pengujian menggunakan Chrome lokal dengan emulasi viewport ponsel. Safari/iOS fisik dan hasil cetak fisik belum diuji.

Aset portrait digambar melalui Canvas dengan rasio asli dan potongan tepi seperlunya agar logo tetap proporsional pada ukuran kartu terbaru. Template Panitia menggunakan rekonstruksi imagegen, dengan keterbatasan yang dicatat di ASSET-NOTES.md. File sumber template Peserta tetap merupakan salinan persis aset kosong pengguna. Pengguna telah mengizinkan pengunggahan source dan aset template untuk publikasi privat melalui Sites. Aplikasi tetap memproses data dan foto di browser.
