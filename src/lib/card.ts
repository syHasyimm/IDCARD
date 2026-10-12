export const CARD_WIDTH = 1240;
export const CARD_HEIGHT = 1748;
export const PHOTO_AREA = { x: 460, y: 300, width: 680, height: 1170 } as const;

export type CropArea = { x: number; y: number; width: number; height: number };
export type CardData = {
  name: string;
  position: string;
  photo: HTMLImageElement | null;
  crop: CropArea | null;
};

export const TEMPLATE_CONFIG = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  photo: PHOTO_AREA,
  name: { x: 450, y: 1470, width: 630, height: 112, fontSize: 80, minFontSize: 36, weight: 700 },
  position: { x: 280, y: 1623, width: 675, height: 88, fontSize: 54, minFontSize: 30, weight: 400 },
} as const;

let templatePromise: Promise<HTMLImageElement> | undefined;

export function loadTemplate(): Promise<HTMLImageElement> {
  if (!templatePromise) {
    templatePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        Promise.all([
          document.fonts.load('700 80px "Card Sans"'),
          document.fonts.load('400 54px "Card Sans"'),
        ]).then(() => resolve(image), () => {
          templatePromise = undefined;
          reject(new Error('Font kartu gagal dimuat. Muat ulang halaman untuk mencoba lagi.'));
        });
      };
      image.onerror = () => {
        templatePromise = undefined;
        reject(new Error('Template belum dapat dimuat. Muat ulang halaman untuk mencoba lagi.'));
      };
      image.src = `${import.meta.env.BASE_URL}assets/template-clean.png`;
    });
  }
  return templatePromise;
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startingSize: number,
  minimumSize: number,
  weight: number,
): { size: number; fits: boolean } {
  let size = startingSize;
  for (; size >= minimumSize; size--) {
    context.font = `${weight} ${size}px "Card Sans", sans-serif`;
    if (context.measureText(text).width <= maxWidth) return { size, fits: true };
  }
  context.font = `${weight} ${minimumSize}px "Card Sans", sans-serif`;
  return { size: minimumSize, fits: false };
}

function drawLabel(
  context: CanvasRenderingContext2D,
  value: string,
  placeholder: string,
  area: typeof TEMPLATE_CONFIG.name | typeof TEMPLATE_CONFIG.position,
  align: 'left' | 'center',
): boolean {
  const text = value.trim().replace(/\s+/g, ' ') || placeholder;
  const fitted = fitText(context, text, area.width, area.fontSize, area.minFontSize, area.weight);
  context.save();
  context.beginPath();
  context.rect(area.x, area.y, area.width, area.height);
  context.clip();
  context.fillStyle = value.trim() ? '#ffffff' : '#d9d2d7';
  context.font = `${area.weight} ${fitted.size}px "Card Sans", sans-serif`;
  context.textAlign = align;
  context.textBaseline = 'middle';
  const x = align === 'center' ? area.x + area.width / 2 : area.x;
  context.fillText(text, x, area.y + area.height / 2 + 2);
  context.restore();
  return fitted.fits;
}

function drawEmptyPhoto(context: CanvasRenderingContext2D): void {
  const centerX = PHOTO_AREA.x + PHOTO_AREA.width / 2;
  context.save();
  context.fillStyle = 'rgba(255, 255, 255, 0.86)';
  context.beginPath();
  context.roundRect(centerX - 190, 740, 380, 370, 20);
  context.fill();
  context.fillStyle = '#b58071';
  context.beginPath();
  context.arc(centerX, 853, 52, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.roundRect(centerX - 99, 915, 198, 105, [90, 90, 16, 16]);
  context.fill();
  context.fillStyle = '#5b4c53';
  context.font = '400 29px "Card Sans", sans-serif';
  context.textAlign = 'center';
  context.fillText('Foto Anda di sini', centerX, 1067);
  context.restore();
}

export function renderCard(
  canvas: HTMLCanvasElement,
  template: HTMLImageElement,
  data: CardData,
): { nameFits: boolean; positionFits: boolean } {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  // Use the same rasterization path for displayed preview and detached export.
  // Chrome can otherwise switch only the preview to CPU after a readback.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Browser ini belum mendukung pembuatan kartu.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(template, 0, 0, CARD_WIDTH, CARD_HEIGHT);

  if (data.photo && data.crop && data.crop.width > 0 && data.crop.height > 0) {
    const { x, y, width, height } = PHOTO_AREA;
    context.save();
    context.beginPath();
    context.rect(x, y, width, height);
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
  } else {
    drawEmptyPhoto(context);
  }

  return {
    nameFits: drawLabel(context, data.name, 'Nama Anda', TEMPLATE_CONFIG.name, 'center'),
    positionFits: drawLabel(context, data.position, 'Jabatan Anda', TEMPLATE_CONFIG.position, 'left'),
  };
}

export async function exportPng(template: HTMLImageElement, data: CardData): Promise<Blob> {
  if (!data.name.trim() || !data.position.trim() || !data.photo || !data.crop) {
    throw new Error('Lengkapi nama, jabatan, dan foto sebelum mengunduh kartu.');
  }
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  const result = renderCard(canvas, template, data);
  if (!result.nameFits || !result.positionFits) {
    throw new Error('Teks terlalu panjang. Singkat nama atau jabatan sebelum mengunduh.');
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG gagal dibuat. Coba unduh sekali lagi.'));
    }, 'image/png');
  });
}

export function makeFilename(name: string): string {
  const safe = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return `id-card-${safe || 'panitia'}.png`;
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
