import { withPrintResolution } from './jpeg';

export const PRINT_DPI = 300;
export const JPEG_QUALITY = 0.95;
export const CARD_SIZE_CM = { width: 5.5, height: 8.5 } as const;
export const CARD_WIDTH = Math.round(CARD_SIZE_CM.width * PRINT_DPI / 2.54);
export const CARD_HEIGHT = Math.round(CARD_SIZE_CM.height * PRINT_DPI / 2.54);
export const PHOTO_SIZE_CM = { width: 4, height: 6 } as const;
const photoWidth = PHOTO_SIZE_CM.width * PRINT_DPI / 2.54;
const photoHeight = PHOTO_SIZE_CM.height * PRINT_DPI / 2.54;
export const PHOTO_AREA = { x: 140, y: 166, width: photoWidth, height: photoHeight } as const;

export type CardKind = 'panitia' | 'peserta';
export const CARD_VARIANTS = {
  panitia: { label: 'Panitia', detailLabel: 'Jabatan', detailPlaceholder: 'Jabatan Anda', asset: 'template-background.png', nameplateColors: { name: '#31242d', detail: '#48333f' } },
  peserta: { label: 'Peserta', detailLabel: 'Pangkalan', detailPlaceholder: 'Pangkalan Anda', asset: 'template-peserta.png', nameplateColors: { name: '#b91c1c', detail: '#991b1b' } },
} as const;

export type CropArea = { x: number; y: number; width: number; height: number };
export type CardData = {
  name: string;
  photo: HTMLImageElement | null;
  crop: CropArea | null;
} & ({ kind: 'panitia'; position: string } | { kind: 'peserta'; pangkalan: string });

export const TEMPLATE_CONFIG = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  photo: PHOTO_AREA,
  name: { x: 164, y: 888, width: photoWidth - 48, height: 50, fontSize: 32, minFontSize: 18, weight: 700, tracking: 0 },
  position: { x: 164, y: 950, width: photoWidth - 48, height: 42, fontSize: 23, minFontSize: 14, weight: 600, tracking: 0.8 },
} as const;

const templatePromises = new Map<CardKind, Promise<HTMLImageElement>>();

export function loadTemplate(kind: CardKind = 'panitia'): Promise<HTMLImageElement> {
  const cached = templatePromises.get(kind);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        Promise.all([
          document.fonts.load('700 80px "Card Sans"'),
          document.fonts.load('600 42px "Card Sans"'),
        ]).then(() => resolve(image), () => {
          templatePromises.delete(kind);
          reject(new Error('Font kartu gagal dimuat. Muat ulang halaman untuk mencoba lagi.'));
        });
      };
      image.onerror = () => {
        templatePromises.delete(kind);
        reject(new Error('Template belum dapat dimuat. Muat ulang halaman untuk mencoba lagi.'));
      };
      image.src = `${import.meta.env.BASE_URL}assets/${CARD_VARIANTS[kind].asset}`;
    });
  templatePromises.set(kind, promise);
  return promise;
}

function cardDetail(data: CardData): string {
  return data.kind === 'peserta' ? data.pangkalan : data.position;
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startingSize: number,
  minimumSize: number,
  weight: number,
  tracking: number,
): { size: number; fits: boolean } {
  let size = startingSize;
  for (; size >= minimumSize; size--) {
    context.font = `${weight} ${size}px "Card Sans", sans-serif`;
    if (textWidth(context, text, tracking) <= maxWidth) return { size, fits: true };
  }
  context.font = `${weight} ${minimumSize}px "Card Sans", sans-serif`;
  return { size: minimumSize, fits: false };
}

function textWidth(context: CanvasRenderingContext2D, text: string, tracking: number): number {
  if (!tracking) return context.measureText(text).width;
  const characters = Array.from(text);
  return characters.reduce((width, character) => width + context.measureText(character).width, 0)
    + tracking * Math.max(0, characters.length - 1);
}

function drawLabel(
  context: CanvasRenderingContext2D,
  value: string,
  placeholder: string,
  area: typeof TEMPLATE_CONFIG.name | typeof TEMPLATE_CONFIG.position,
): boolean {
  const text = (value.trim().replace(/\s+/g, ' ') || placeholder).toLocaleUpperCase('id-ID');
  const fitted = fitText(context, text, area.width, area.fontSize, area.minFontSize, area.weight, area.tracking);
  context.save();
  context.beginPath();
  context.rect(area.x, area.y, area.width, area.height);
  context.clip();
  context.fillStyle = value.trim() ? '#ffffff' : '#d9d2d7';
  context.font = `${area.weight} ${fitted.size}px "Card Sans", sans-serif`;
  context.textAlign = area.tracking ? 'left' : 'center';
  context.textBaseline = 'middle';
  const centerX = area.x + area.width / 2;
  const y = area.y + area.height / 2 + 2;
  if (area.tracking) {
    let x = centerX - textWidth(context, text, area.tracking) / 2;
    for (const character of text) {
      context.fillText(character, x, y);
      x += context.measureText(character).width + area.tracking;
    }
  } else {
    context.fillText(text, centerX, y);
  }
  context.restore();
  return fitted.fits;
}

function drawNameplates(context: CanvasRenderingContext2D, kind: CardKind): void {
  const colors = CARD_VARIANTS[kind].nameplateColors;
  context.save();
  context.fillStyle = colors.name;
  context.beginPath();
  context.roundRect(PHOTO_AREA.x, 888, PHOTO_AREA.width, 50, 12);
  context.fill();
  context.fillStyle = colors.detail;
  context.beginPath();
  context.roundRect(PHOTO_AREA.x, 950, PHOTO_AREA.width, 42, 10);
  context.fill();
  context.restore();
}

function drawPortraitBackground(context: CanvasRenderingContext2D, template: HTMLImageElement): void {
  // Cover the new print ratio without stretching the supplied artwork.
  // The slight crop is centered; the event logo and role lettering remain inside.
  const scale = Math.max(CARD_WIDTH / template.naturalWidth, CARD_HEIGHT / template.naturalHeight);
  const width = template.naturalWidth * scale;
  const height = template.naturalHeight * scale;
  context.drawImage(template, (CARD_WIDTH - width) / 2, (CARD_HEIGHT - height) / 2, width, height);
}

export function renderCard(
  canvas: HTMLCanvasElement,
  template: HTMLImageElement,
  data: CardData,
): { nameFits: boolean; detailFits: boolean } {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  // Use the same rasterization path for displayed preview and detached export.
  // Chrome can otherwise switch only the preview to CPU after a readback.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Browser ini belum mendukung pembuatan kartu.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  drawPortraitBackground(context, template);

  if (data.photo && data.crop && data.crop.width > 0 && data.crop.height > 0) {
    const { x, y, width, height } = PHOTO_AREA;
    context.save();
    context.fillStyle = '#ffffff';
    context.shadowColor = 'rgba(49, 36, 45, 0.16)';
    context.shadowBlur = 16;
    context.shadowOffsetY = 5;
    context.beginPath();
    context.roundRect(x - 7, y - 7, width + 14, height + 14, 14);
    context.fill();
    context.shadowColor = 'transparent';
    context.beginPath();
    context.roundRect(x, y, width, height, 8);
    context.clip();
    context.drawImage(
      data.photo,
      data.crop.x,
      data.crop.y,
      data.crop.width,
      data.crop.height,
      x,
      y,
      width,
      height,
    );
    context.restore();
  }

  drawNameplates(context, data.kind);

  return {
    nameFits: drawLabel(context, data.name, 'Nama Anda', TEMPLATE_CONFIG.name),
    detailFits: drawLabel(context, cardDetail(data), CARD_VARIANTS[data.kind].detailPlaceholder, TEMPLATE_CONFIG.position),
  };
}

export async function exportJpg(template: HTMLImageElement, data: CardData): Promise<Blob> {
  if (!data.name.trim() || !cardDetail(data).trim() || (data.photo && !data.crop)) {
    throw new Error(`Lengkapi nama dan ${CARD_VARIANTS[data.kind].detailLabel.toLowerCase()} sebelum mengunduh. Tunggu foto selesai diproses jika Anda menambahkannya.`);
  }
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  const result = renderCard(canvas, template, data);
  if (!result.nameFits || !result.detailFits) {
    throw new Error(`Teks terlalu panjang. Singkat nama atau ${CARD_VARIANTS[data.kind].detailLabel.toLowerCase()} sebelum mengunduh.`);
  }
  const imageBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob?.type === 'image/jpeg') resolve(blob);
      else reject(new Error('JPG gagal dibuat. Coba unduh sekali lagi atau gunakan browser terbaru.'));
    }, 'image/jpeg', JPEG_QUALITY);
  });
  return withPrintResolution(imageBlob, PRINT_DPI);
}

export function makeFilename(name: string, kind: CardKind = 'panitia'): string {
  const safe = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return `id-card-${kind}-${safe || 'kartu'}.jpg`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Allow the browser to start saving before releasing the Blob URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
