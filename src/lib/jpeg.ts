/** Set JFIF print density without re-encoding the JPEG image data. */
export async function withPrintResolution(blob: Blob, dpi: number): Promise<Blob> {
  const source = new Uint8Array(await blob.arrayBuffer());
  if (source.length < 4 || source[0] !== 0xff || source[1] !== 0xd8
    || source.at(-2) !== 0xff || source.at(-1) !== 0xd9) {
    throw new Error('File JPG tidak valid. Coba unduh kembali.');
  }
  const density = Math.round(dpi);
  if (!Number.isFinite(density) || density < 1 || density > 65535) {
    throw new Error('Resolusi cetak JPG tidak valid.');
  }
  const view = new DataView(source.buffer);
  let offset = 2;
  while (offset + 3 < source.length) {
    if (source[offset] !== 0xff) throw new Error('File JPG tidak valid. Coba unduh kembali.');
    while (source[offset] === 0xff) offset++;
    const marker = source[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > source.length) throw new Error('File JPG tidak lengkap. Coba unduh kembali.');
    const length = view.getUint16(offset);
    if (length < 2 || offset + length > source.length) throw new Error('File JPG tidak lengkap. Coba unduh kembali.');
    const isJfif = marker === 0xe0 && length >= 16
      && source[offset + 2] === 0x4a && source[offset + 3] === 0x46
      && source[offset + 4] === 0x49 && source[offset + 5] === 0x46 && source[offset + 6] === 0;
    if (isJfif) {
      source[offset + 9] = 1; // Density unit: dots per inch.
      view.setUint16(offset + 10, density);
      view.setUint16(offset + 12, density);
      return new Blob([source], { type: 'image/jpeg' });
    }
    offset += length;
  }

  // Some browser encoders omit JFIF. Add the standard APP0 header after SOI.
  const jfif = new Uint8Array([
    0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0,
    1, 2, 1, 0, 0, 0, 0, 0, 0,
  ]);
  const densityView = new DataView(jfif.buffer);
  densityView.setUint16(12, density);
  densityView.setUint16(14, density);
  return new Blob([source.slice(0, 2), jfif, source.slice(2)], { type: 'image/jpeg' });
}
