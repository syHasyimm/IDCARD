**Verifikasi implementasi — 13 Oktober 2026**

- Build TypeScript dan Vite berhasil.
- Empat tes browser berhasil: dua skenario pada Chrome desktop dan dua pada Chrome dengan viewport ponsel Pixel 7.
- Dua tes tambahan terhadap hasil produksi yang disajikan melalui Vite preview berhasil pada ukuran desktop dan ponsel.
- Dimensi unduhan PNG diperiksa langsung dari header file: 1240 × 1748 px.
- Pixel PNG yang diunduh sama dengan pixel preview pada skenario uji.
- Zoom dan posisi crop dengan keyboard mengubah preview sebelum tombol panah dilepas.
- Nama/jabatan yang tidak muat serta input kosong menonaktifkan unduhan.
- File PNG tidak valid dan foto di atas 10 MB ditolak dengan pesan yang jelas.
- Reset membersihkan formulir dan foto.
- Tidak ada request upload/POST pada skenario membuat dan mengunduh kartu.
- Lebar halaman tidak melebihi viewport pada desktop dan ponsel yang diuji.
- Screenshot awal dan setelah unduh diperiksa secara visual.

Browser yang diuji adalah Chrome lokal dengan emulasi viewport ponsel. Safari/iOS fisik dan hasil cetak fisik belum diuji.

Template bersih menggunakan rekonstruksi imagegen, dengan keterbatasan yang dicatat di ASSET-NOTES.md. Pengguna telah mengizinkan pengunggahan source dan aset template untuk publikasi privat melalui Sites. Aplikasi tetap memproses nama, jabatan, dan foto di browser.
