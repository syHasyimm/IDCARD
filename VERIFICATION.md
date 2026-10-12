**Verifikasi implementasi — 13 Oktober 2026**

- Build TypeScript dan Vite berhasil.
- Versi dengan dua tab sebelumnya lolos delapan tes: empat skenario pada Chrome desktop dan empat pada Chrome dengan viewport ponsel Pixel 7. Perubahan warna label Peserta terbaru lolos dua tes yang difokuskan pada kartu Peserta, masing-masing desktop dan ponsel.
- Dimensi unduhan PNG diperiksa langsung dari header file: 1240 × 1748 px.
- Metadata PNG memiliki satu pHYs chunk 300 DPI yang valid, termasuk CRC.
- Area foto memiliki rasio 2:3 dan ukuran fisik 4 × 6 cm pada acuan cetak tersebut.
- Unduhan tanpa foto berhasil; tidak ada placeholder foto yang ikut dirender.
- Nama dan jabatan mixed case dirender UPPERCASE pada Canvas hasil ekspor.
- Tab Peserta menampilkan Nama dan Pangkalan tanpa input Jabatan; Pangkalan dirender UPPERCASE pada PNG.
- Pergantian cepat Peserta → Panitia saat aset peserta sengaja diperlambat tetap menghasilkan template yang benar.
- Navigasi tab dengan keyboard berfungsi; Jabatan dan Pangkalan tetap terpisah saat tab diganti.
- Nama/foto tetap tersedia saat tab diganti, dan Reset membersihkan data sambil mempertahankan pilihan tab.
- PNG peserta mempertahankan desain merah asli, dimensi kartu, dan metadata 300 DPI.
- Label Nama Peserta menggunakan merah tua #B91C1C; label Pangkalan menggunakan #991B1B, dengan teks putih. Preview dan PNG diperiksa secara visual setelah perubahan. Warna label Panitia tetap mengikuti template cokelatnya.
- Pixel PNG yang diunduh sama dengan pixel preview pada skenario uji.
- Zoom dan posisi crop dengan keyboard mengubah preview sebelum tombol panah dilepas.
- Nama/jabatan yang tidak muat serta input kosong menonaktifkan unduhan.
- File PNG tidak valid dan foto di atas 10 MB ditolak dengan pesan yang jelas.
- Reset membersihkan formulir dan foto.
- Tidak ada request upload/POST pada skenario membuat dan mengunduh kartu.
- Lebar halaman tidak melebihi viewport pada desktop dan ponsel yang diuji.
- Screenshot awal dan setelah unduh diperiksa secara visual.

Browser yang diuji adalah Chrome lokal dengan emulasi viewport ponsel. Safari/iOS fisik dan hasil cetak fisik belum diuji.

Template Panitia menggunakan rekonstruksi imagegen, dengan keterbatasan yang dicatat di ASSET-NOTES.md. Template Peserta adalah salinan persis aset kosong yang disediakan pengguna. Pengguna telah mengizinkan pengunggahan source dan aset template untuk publikasi privat melalui Sites. Aplikasi tetap memproses data dan foto di browser.
