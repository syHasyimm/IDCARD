**Kartu. — Generator ID Card**

Aplikasi React + TypeScript + Vite dengan tab Panitia dan Peserta, foto opsional, crop foto, preview otomatis, serta unduhan JPG. Panitia membutuhkan Nama dan Jabatan; Peserta membutuhkan Nama dan Pangkalan. Semua teks ditampilkan UPPERCASE. Semua pengolahan data berjalan di browser.

Jalankan dari folder proyek:

```sh
npm install
npm run dev
```

Buat hasil produksi:

```sh
npm run build
npm run preview
```

Hasil build ada di `dist/`. Sajikan folder tersebut melalui hosting statis. Node.js diperlukan untuk pengembangan dan build; tidak ada backend aplikasi atau database. Gunakan Node.js 22.12+ atau versi yang memenuhi persyaratan Vite yang terpasang.

Penggunaan:

1. Pilih tab Panitia atau Peserta. Isi Nama dan Jabatan untuk Panitia, atau Nama dan Pangkalan untuk Peserta.
2. Jika ingin menambahkan foto, pilih JPG/PNG maksimal 10 MB; resolusi maksimal 40 MP dan sisi maksimal 12.000 px. Foto boleh dikosongkan.
3. Geser foto pada editor dan atur zoom.
4. Periksa preview dan klik Unduh JPG.
5. Reset untuk membuat kartu berikutnya.

Jabatan dan Pangkalan disimpan terpisah. Nama, foto, dan pengaturan crop dipertahankan saat berpindah tab. Reset membersihkan seluruh data dan foto, sambil mempertahankan pilihan tab. Tab juga dapat dipilih melalui tombol panah, Home, dan End. Nama unduhan membedakan jenis kartu: id-card-panitia-nama.jpg atau id-card-peserta-nama.jpg.

Kedua template memakai susunan portrait yang sama dengan ukuran kartu **lebar 5,5 cm × tinggi 8,5 cm**. JPG berukuran 650 × 1004 px dengan metadata JFIF 300 DPI dan kualitas JPEG 95%; pembulatan ke piksel utuh menghasilkan selisih ukuran cetak kurang dari 0,01 cm. Gunakan ukuran asli/100% saat mencetak. Area foto berukuran **3 × 4 cm** dengan rasio crop **3:4** untuk Panitia dan Peserta. Foto diberi bingkai putih, sedangkan nama dan Jabatan/Pangkalan ditata dalam dua label ringkas di bawah foto. Label Peserta memakai merah tua agar sesuai template merah. Tanpa foto, watermark desain tetap terlihat dan tidak ada placeholder foto pada hasil unduhan. Foto PNG transparan maupun JPG/PNG berlatar dapat digunakan sebagai input; hasil kartu selalu JPG dengan latar desain. Tidak ada penghapus latar otomatis.

Data hanya disimpan dalam memori aplikasi, dan tidak diunggah ke server oleh aplikasi. Memuat ulang halaman mengosongkan form. Template dan font disertakan sebagai aset lokal. Akses aplikasi tetap memerlukan penyajian melalui HTTP/HTTPS; aplikasi tidak dirancang dibuka dengan `file://`.

Konfigurasi template, posisi, dan ukuran teks/foto terdapat di `src/lib/card.ts`. Aset portrait digambar melalui Canvas dengan rasio asli dan potongan tepi seperlunya agar logo tetap proporsional pada ukuran kartu terbaru. Panitia memakai `public/assets/template-background.png`: foto contoh, placeholder, dan label lama dibersihkan dengan imagegen; bagian watermark yang tertutup direkonstruksi. Peserta memakai `public/assets/template-peserta.png`, salinan persis file template kosong pengguna tanpa edit pada file sumber. Lihat `ASSET-NOTES.md` untuk catatan aset dan batas kesetiaan template Panitia.

Verifikasi:

```sh
npm test
```

Pengujian browser memerlukan browser Playwright yang tersedia atau Chrome/Edge lokal; lihat `playwright.config.ts`.

Referensi Context7 yang dipakai: React (`/reactjs/react.dev`), Vite (`/vitejs/vite`), react-easy-crop (`/valentinh/react-easy-crop`).

- https://react.dev/reference/react/useEffect
- https://vite.dev/guide/static-deploy.html
- https://github.com/valentinh/react-easy-crop
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
- https://www.w3.org/Graphics/JPEG/jfif3.pdf
