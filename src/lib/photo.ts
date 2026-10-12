export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const MAX_EDGE = 12_000;

async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  const bytes = new Uint8Array(await file.slice(0, 262144).arrayBuffer());
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const view = new DataView(bytes.buffer);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) return null;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      if (length < 7) return null;
      return { height: (bytes[offset + 3] << 8) | bytes[offset + 4], width: (bytes[offset + 5] << 8) | bytes[offset + 6] };
    }
    offset += length;
  }
  return null;
}

function checkDimensions(width: number, height: number): void {
  if (width <= 0 || height <= 0 || width * height > MAX_PIXELS || width > MAX_EDGE || height > MAX_EDGE) {
    throw new Error('Resolusi foto terlalu besar. Gunakan foto maksimal 40 megapixel dan sisi maksimal 12.000 pixel.');
  }
}

export async function loadPhoto(file: File): Promise<{ image: HTMLImageElement; url: string }> {
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Format foto belum didukung. Pilih file JPG atau PNG.');
  }
  if (!file.size) throw new Error('File foto kosong. Pilih foto lain.');
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Ukuran foto melebihi 10 MB. Pilih foto yang lebih kecil.');
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  if (!isPng && !isJpeg) throw new Error('File bukan gambar JPG atau PNG yang valid. Pilih foto lain.');
  const dimensions = await readDimensions(file);
  if (dimensions) checkDimensions(dimensions.width, dimensions.height);

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    // Image decoding applies the camera's EXIF orientation in current browsers.
    checkDimensions(image.naturalWidth, image.naturalHeight);
    return { image, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.startsWith('Resolusi')) throw error;
    throw new Error('Foto tidak dapat dibaca. Pilih file gambar lain.');
  }
}
