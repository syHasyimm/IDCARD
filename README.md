**Kartu. — Generator ID Card**

Aplikasi React + TypeScript + Vite dengan satu template tetap, input Nama/Jabatan/Foto, crop foto, preview otomatis, dan unduhan PNG. Semua pengolahan data berjalan di browser.

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

1. Isi nama dan jabatan.
2. Pilih foto JPG/PNG, maksimal 10 MB; resolusi maksimal 40 MP dan sisi maksimal 12.000 px.
3. Geser foto pada editor dan atur zoom.
4. Periksa preview dan klik Unduh PNG.
5. Reset untuk membuat kartu berikutnya.

Ukuran PNG selalu 1240 × 1748 px, mengikuti rasio template pengguna. PNG transparan dapat mempertahankan tampilan potongan orang seperti contoh asli; JPG/PNG biasa mempertahankan latar fotonya. Tidak ada fitur penghapus latar otomatis.

Data hanya disimpan dalam memori aplikasi, dan tidak diunggah ke server oleh aplikasi. Memuat ulang halaman mengosongkan form. Template dan font disertakan sebagai aset lokal. Akses aplikasi tetap memerlukan penyajian melalui HTTP/HTTPS; aplikasi tidak dirancang dibuka dengan `file://`.

Konfigurasi posisi dan ukuran teks/foto terdapat di `src/lib/card.ts`. Template bersih terdapat di `public/assets/template-clean.png`. Karena sumber dari pengguna sudah berupa gambar gabungan, foto contoh dan placeholder dibersihkan dengan imagegen; bagian watermark yang tertutup direkonstruksi. Lihat `ASSET-NOTES.md` untuk batas kesetiaan desain dan prompt yang digunakan. Aset blank dari editor asli dapat menggantikan file tersebut untuk kesetiaan penuh.

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
