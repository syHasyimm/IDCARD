function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** PNG pHYs records pixels per meter; leave all image data unchanged. */
export async function withPrintResolution(blob: Blob, dpi: number): Promise<Blob> {
  const source = new Uint8Array(await blob.arrayBuffer());
  if (source.length < 33 || source[0] !== 0x89 || source[1] !== 0x50) {
    throw new Error('File PNG tidak valid. Coba unduh kembali.');
  }
  const physical = new Uint8Array(21);
  const physicalView = new DataView(physical.buffer);
  physicalView.setUint32(0, 9);
  physical.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  physicalView.setUint32(8, pixelsPerMeter);
  physicalView.setUint32(12, pixelsPerMeter);
  physical[16] = 1; // unit: meter
  physicalView.setUint32(17, crc32(physical.subarray(4, 17)));

  const parts: Uint8Array<ArrayBuffer>[] = [source.slice(0, 8)];
  const sourceView = new DataView(source.buffer);
  let offset = 8;
  let inserted = false;
  while (offset + 12 <= source.length) {
    const length = sourceView.getUint32(offset);
    const end = offset + length + 12;
    if (end > source.length) throw new Error('File PNG tidak lengkap. Coba unduh kembali.');
    const type = String.fromCharCode(...source.subarray(offset + 4, offset + 8));
    if (type !== 'pHYs') parts.push(source.slice(offset, end));
    if (type === 'IHDR') { parts.push(physical); inserted = true; }
    offset = end;
  }
  if (!inserted || offset !== source.length) throw new Error('File PNG tidak valid. Coba unduh kembali.');
  return new Blob(parts, { type: 'image/png' });
}
