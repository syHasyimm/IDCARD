**Rencana aplikasi generator ID card**

Keputusan pengguna terbaru: aplikasi frontend saja dengan tab Panitia dan Peserta. Panitia membutuhkan Nama dan Jabatan; Peserta membutuhkan Nama dan Pangkalan. Foto opsional dan unduhan PNG untuk keduanya. Seluruh teks ditampilkan UPPERCASE. Foto dan kedua label menggunakan posisi yang sama pada kedua template. Hanya area foto berukuran 4 × 6 cm dengan acuan 300 DPI; ukuran kartu tetap 1240 × 1748 px. Implementasi telah dibuat; panduan penggunaan ada di README.md.

Nama/foto dipertahankan saat tab diganti, sementara Jabatan dan Pangkalan disimpan terpisah. Reset membersihkan kedua set data dan foto. Template peserta menggunakan salinan persis file yang disediakan pengguna. Rencana versi pertama di bawah mencatat cakupan awal, dengan perluasan dua tab tersebut sebagai keputusan terbaru.

Template yang diberikan berukuran 1240 × 1748 px dan sudah berisi foto contoh. Aset kosong dibuat melalui imagegen dengan menghapus foto dan placeholder. Bagian watermark yang sebelumnya tertutup direkonstruksi; lihat ASSET-NOTES.md. Hasil PNG tetap berukuran 1240 × 1748 px. Foto JPG/PNG biasa mempertahankan latarnya; gunakan PNG transparan untuk tampilan seperti potongan orang pada contoh asli.

**1. Tujuan dan cakupan versi pertama**

Aplikasi web satu halaman untuk membuat satu ID card per proses. Pengguna mengisi nama dan jabatan, memilih foto dari perangkat, mengatur potongan foto, lalu mengunduh hasil sesuai template yang sudah ditetapkan.

Seluruh pengolahan data dan pembuatan PNG dilakukan di browser. Hosting hanya menyajikan file aplikasi dan aset template. Data pribadi dan foto tidak dikirim ke server oleh aplikasi. Data formulir disimpan sementara dalam memori aplikasi; memuat ulang halaman mengosongkan formulir.

**2. Alur penggunaan**

1. Buka aplikasi; template terlihat di area preview.
2. Isi Nama dan Jabatan.
3. Jika ingin menambahkan foto, pilih JPG/JPEG atau PNG dari perangkat. Foto boleh dikosongkan.
4. Geser dan zoom foto agar wajah masuk ke area foto; rasio crop mengikuti template.
5. Preview diperbarui saat teks atau pengaturan foto berubah.
6. Klik Unduh PNG setelah input valid dan aset selesai dimuat.
7. Klik Reset untuk membuat kartu berikutnya.

Tidak diperlukan langkah generate terpisah karena preview dibuat otomatis. Tombol unduh menyusun PNG final dengan resolusi ekspor yang telah ditentukan.

**3. Bahan yang dibutuhkan dari pemilik template**

| Bahan | Keterangan |
| --- | --- |
| Template kosong | PNG resolusi tinggi, tanpa contoh nama/jabatan/foto yang sudah menyatu ke desain. Logo dan elemen dekoratif tetap boleh menyatu. |
| Contoh kartu jadi | Referensi penempatan, ukuran teks, dan potongan foto yang diharapkan. |
| Ukuran dan orientasi | Lebar dan tinggi kartu; portrait atau landscape. Jika untuk cetak, sertakan ukuran fisik dalam mm/cm. |
| Area Nama dan Jabatan | Posisi, batas lebar/tinggi, perataan, warna, serta aturan huruf kapital. |
| Font | Nama font dan file font yang boleh digunakan/disertakan, jika desain memakai font khusus. |
| Area Foto | Posisi, ukuran, bentuk, dan apakah foto berada di bawah bingkai dekoratif. |

Jika sumber desain berupa PDF, SVG, atau file desain lain, aset perlu disiapkan menjadi template gambar yang sesuai sebelum integrasi. Untuk versi pertama, rencana mengasumsikan kartu satu sisi; sisi belakang memerlukan aset dan aturan ekspor tambahan.

Template akan dikonfigurasi saat pengembangan. Aplikasi tidak menebak letak teks atau foto dari gambar. Jika foto perlu berada di belakang bingkai, aset dipisah menjadi background dan overlay transparan agar urutan lapisan benar.

**4. Fitur dan aturan versi pertama**

- Nama dan Jabatan wajib diisi sebelum mengunduh. Foto opsional; tanpa foto, desain watermark tetap terlihat pada hasil.
- Nama dan Jabatan otomatis UPPERCASE, dengan label sejajar di bawah foto.
- Area foto memiliki rasio 2:3 dan ukuran cetak 4 × 6 cm pada metadata 300 DPI. Cetak seluruh kartu pada ukuran asli/100% untuk mempertahankan ukuran area foto.
- Form memiliki label jelas, validasi, dan pesan kegagalan yang bisa dipahami.
- Usulan batas ukuran foto adalah 10 MB; gambar juga perlu diperiksa agar dimensi hasil decode tidak membebani perangkat.
- Foto mempertahankan proporsi, mendukung geser dan zoom, serta dipotong mengikuti bentuk area pada template.
- Foto dari ponsel diperiksa orientasinya agar tidak tampil miring.
- Nama/jabatan panjang menyesuaikan ukuran font sampai batas keterbacaan. Jika masih tidak muat, tampilkan pesan untuk menyingkat teks. Pembungkusan menjadi beberapa baris hanya dipakai jika sesuai desain template.
- Preview dan PNG memakai fungsi penyusun kartu serta konfigurasi posisi yang sama.
- Ukuran PNG mengikuti konfigurasi ekspor, tidak bergantung pada ukuran layar atau ukuran preview.
- Ekspor menunggu template, foto, dan font selesai dimuat.
- Tombol unduh memiliki status memproses dan mencegah klik berulang selama ekspor.
- Nama file mengikuti pola id-card-nama.png dengan karakter nama file yang telah dibersihkan.
- Form dan preview tersusun berdampingan di desktop serta bertumpuk di ponsel.
- Reset menghapus input dan foto dari state aplikasi, serta melepaskan resource gambar yang tidak lagi dipakai.

**5. Tech stack yang direkomendasikan**

| Kebutuhan | Teknologi | Alasan |
| --- | --- | --- |
| Antarmuka dan state | React | Mengelola form, crop foto, status validasi, dan preview dalam satu halaman. |
| Bahasa | TypeScript | Menjaga konsistensi tipe data pengguna dan konfigurasi template. |
| Pengembangan/build | Vite | Menghasilkan aplikasi statis yang dapat dihosting tanpa backend aplikasi. |
| Tampilan responsif | CSS biasa / CSS Modules | Cukup untuk satu halaman dengan kebutuhan styling yang terkontrol. |
| Crop foto | react-easy-crop | Mendukung rasio crop tetap, geser, zoom, dan koordinat potongan foto. |
| Penyusunan kartu | Canvas 2D API | Menggambar template, foto, dan teks secara langsung di browser. |
| Ekspor PNG | Canvas toBlob + Blob URL | Membuat file PNG dan memicu unduhan di perangkat pengguna. |
| Hosting | Hosting statis, misalnya GitHub Pages | Menyajikan hasil build dan aset aplikasi. |

Node.js digunakan untuk proses pengembangan/build. Aplikasi yang dibuka pengguna tidak membutuhkan proses Node.js di server. Paket crop hanya membantu pengaturan foto; penyusunan kartu tetap memakai Canvas.

**6. Rancangan teknis**

Alur data: Form + Foto lokal + Konfigurasi template → Crop foto → Canvas kartu → Preview → File PNG.

Komponen utama:

- Form data: input nama, jabatan, pilihan foto, dan validasi.
- Pengaturan foto: rasio, posisi crop, dan zoom.
- Preview kartu: menampilkan hasil render dengan ukuran tampilan yang responsif.
- Penyusun kartu: fungsi bersama untuk menggambar semua lapisan.
- Pengunduh: menyiapkan PNG, nama file, status proses, dan penanganan error.

Konfigurasi template menyimpan ukuran dasar, resolusi ekspor, koordinat dan batas teks, style font, serta area foto. Urutan gambar mengikuti kebutuhan desain: background, foto, overlay bila ada, lalu teks.

Template dan font disertakan sebagai aset aplikasi dari origin yang sama. Foto dibaca dari perangkat melalui browser. Pendekatan ini menghindari ketergantungan pada layanan gambar eksternal untuk membuat kartu.

**7. Tahapan pengerjaan dan hasilnya**

| Tahap | Pekerjaan | Hasil yang dapat diperiksa |
| --- | --- | --- |
| 1. Pemetaan template | Periksa aset, ukuran, font, posisi, urutan lapisan, dan aturan teks panjang. | Konfigurasi template dan satu contoh kartu referensi. |
| 2. Form dan crop | Buat form responsif, validasi, unggah foto, geser, zoom, dan reset. | Pengguna dapat memasukkan seluruh data dengan benar. |
| 3. Penyusunan kartu | Gabungkan template, foto, dan teks dengan fungsi render bersama. | Preview mengikuti contoh desain. |
| 4. Ekspor PNG | Atur resolusi final, tunggu aset, buat file, dan tangani kegagalan. | PNG dapat diunduh dan sesuai preview. |
| 5. Verifikasi dan build | Uji kasus penting, periksa hasil build, dan siapkan untuk hosting statis. | Aplikasi siap dipublikasikan. |

**8. Kriteria selesai**

- Nama, jabatan, dan foto tampil pada posisi yang sesuai template.
- Crop foto tidak meregangkan wajah atau keluar dari area foto.
- Nama/jabatan panjang tidak menimpa elemen desain atau terpotong tanpa pemberitahuan.
- PNG memiliki dimensi ekspor yang konsisten di desktop dan ponsel.
- Preview dan file unduhan cocok secara visual.
- Foto invalid, gagal dimuat, dan terlalu besar ditangani dengan pesan yang jelas.
- Pengunduhan diperiksa di Chrome/Edge desktop dan browser ponsel Android/iOS yang tersedia untuk pengujian.
- Pengolahan data pribadi tidak menghasilkan request unggahan ke server.
- Jika hasil akan dicetak, uji satu kartu pada ukuran fisik yang disepakati. Ketajaman perlu dihitung dari jumlah pixel dan ukuran cetak; tidak cukup mengandalkan label DPI file.

**9. Pengembangan lanjutan jika dibutuhkan**

PDF, sisi belakang, pilihan beberapa template, generator massal, dan penyimpanan draft lokal dapat direncanakan setelah versi pertama selesai. Fitur tersebut tidak termasuk kebutuhan versi pertama yang dipilih pengguna.

**Referensi teknologi**

- [Vite: static deployment](https://vite.dev/guide/static-deploy.html)
- [react-easy-crop: dokumentasi resmi](https://github.com/valentinh/react-easy-crop)
- [Canvas: penggunaan gambar](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images)
- [Canvas: ekspor dengan toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
