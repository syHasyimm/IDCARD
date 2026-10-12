import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

function checkPrintResolution(bytes: Buffer) {
  const physical: Buffer[] = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.toString('ascii', offset + 4, offset + 8) === 'pHYs') physical.push(bytes.subarray(offset, offset + length + 12));
    offset += length + 12;
  }
  expect(physical).toHaveLength(1);
  expect(physical[0].readUInt32BE(0)).toBe(9);
  expect(physical[0].readUInt32BE(8)).toBe(11811);
  expect(physical[0].readUInt32BE(12)).toBe(11811);
  expect(physical[0][16]).toBe(1);
  // Independently verified CRC for the standard 300 DPI pHYs payload.
  expect(physical[0].readUInt32BE(17)).toBe(0x78a53f76);
}

async function fingerprint(page: Page) {
  return page.locator('canvas').evaluate(async (canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    const hash = await crypto.subtle.digest('SHA-256', pixels);
    return Array.from(new Uint8Array(hash)).map((value) => value.toString(16).padStart(2, '0')).join('');
  });
}

async function uploadFixture(page: Page) {
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 1000;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#e8b1a0';
    context.fillRect(0, 0, 600, 1000);
    context.fillStyle = '#243d60';
    context.fillRect(0, 500, 600, 500);
    context.fillStyle = '#f1d695';
    context.fillRect(75, 70, 200, 350);
    context.fillStyle = '#9cc8ae';
    context.fillRect(375, 60, 160, 200);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Unggah foto JPG atau PNG').setInputFiles({
    name: 'foto-panitia.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64'),
  });
  await expect(page.getByRole('button', { name: 'Hapus foto' })).toBeVisible();
}

test('PNG matches preview, cropping changes result, and reset clears data without uploads', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const uploads: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.method() !== 'GET') uploads.push(`${request.method()} ${request.url()}`);
  });
  await page.goto('/');
  const downloadButton = page.getByRole('button', { name: 'Unduh PNG', exact: true });
  await expect(downloadButton).toBeDisabled();
  await expect(page.getByText('Memuat template', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('initial.png'), fullPage: true });
  await page.getByLabel('Nama lengkap').fill('Siti Nur Aisyah');
  await page.getByRole('textbox', { name: 'Jabatan', exact: true }).fill('Koordinator Acara');
  await uploadFixture(page);
  await expect(downloadButton).toBeEnabled();
  const before = await fingerprint(page);
  await page.getByLabel('Zoom', { exact: true }).fill('1.6');
  await expect.poll(() => fingerprint(page)).not.toBe(before);
  await expect(downloadButton).toBeEnabled();
  const afterZoom = await fingerprint(page);
  await page.locator('.cropper').focus();
  await page.keyboard.down('ArrowRight');
  // Preview must follow the crop before keyup, not merely at interaction completion.
  await expect.poll(() => fingerprint(page)).not.toBe(afterZoom);
  await page.keyboard.up('ArrowRight');
  await expect(downloadButton).toBeEnabled();
  const preview = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
  expect(download.suggestedFilename()).toBe('id-card-siti-nur-aisyah.png');
  const saved = testInfo.outputPath('id-card.png');
  await download.saveAs(saved);
  const bytes = await readFile(saved);
  expect(bytes.readUInt32BE(16)).toBe(1240);
  expect(bytes.readUInt32BE(20)).toBe(1748);
  checkPrintResolution(bytes);
  const pixelComparison = await page.evaluate(async ({ preview, output }) => {
    async function pixels(src: string) {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    const [first, second] = await Promise.all([pixels(preview), pixels(output)]);
    let different = 0;
    let maxDelta = 0;
    let minX = 1240, minY = 1748, maxX = 0, maxY = 0;
    for (let i = 0; i < first.length; i++) {
      const delta = Math.abs(first[i] - second[i]);
      maxDelta = Math.max(maxDelta, delta);
      if (delta) {
        different++;
        const pixel = Math.floor(i / 4);
        minX = Math.min(minX, pixel % 1240); maxX = Math.max(maxX, pixel % 1240);
        minY = Math.min(minY, Math.floor(pixel / 1240)); maxY = Math.max(maxY, Math.floor(pixel / 1240));
      }
    }
    return { different, maxDelta, bounds: { minX, minY, maxX, maxY } };
  }, { preview, output: `data:image/png;base64,${bytes.toString('base64')}` });
  expect(pixelComparison).toEqual({ different: 0, maxDelta: 0, bounds: { minX: 1240, minY: 1748, maxX: 0, maxY: 0 } });
  await page.screenshot({ path: testInfo.outputPath('completed.png'), fullPage: true });
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByLabel('Nama lengkap')).toHaveValue('');
  await expect(page.getByRole('textbox', { name: 'Jabatan', exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Hapus foto' })).toHaveCount(0);
  await expect(downloadButton).toBeDisabled();
  expect(errors).toEqual([]);
  expect(uploads).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('photo is optional, labels are uppercase, and photo renders at 4 by 6 cm', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    type Observations = Window & { __cardText: string[]; __photoSizes: number[][] };
    const observations = window as Observations;
    observations.__cardText = [];
    observations.__photoSizes = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof fillText>) {
      observations.__cardText.push(args[0]);
      return fillText.apply(this, args);
    };
    const drawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args: Parameters<typeof drawImage>) {
      if (args.length === 9) observations.__photoSizes.push([args[7], args[8]]);
      return drawImage.apply(this, args);
    };
  });
  await page.goto('/');
  await page.getByLabel('Nama lengkap').fill('Siti Nur Aisyah');
  await page.getByRole('textbox', { name: 'Jabatan', exact: true }).fill('Koordinator Acara');
  const button = page.getByRole('button', { name: 'Unduh PNG', exact: true });
  await expect(button).toBeEnabled();
  await expect(page.getByText('Kartu siap diunduh tanpa foto.', { exact: true })).toBeVisible();
  await page.evaluate(() => { (window as Window & { __cardText: string[] }).__cardText = []; });
  const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
  const saved = testInfo.outputPath('without-photo.png');
  await download.saveAs(saved);
  const bytes = await readFile(saved);
  checkPrintResolution(bytes);
  const observations = await page.evaluate(() => {
    const observed = window as Window & { __cardText: string[]; __photoSizes: number[][] };
    return { text: observed.__cardText, sizes: observed.__photoSizes };
  });
  expect(observations.text[0]).toBe('SITI NUR AISYAH');
  expect(observations.text.slice(1).join('')).toBe('KOORDINATOR ACARA');
  expect(observations.sizes).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath('without-photo-ui.png'), fullPage: true });
  await uploadFixture(page);
  await expect(button).toBeEnabled();
  const size = await page.evaluate(() => (window as Window & { __photoSizes: number[][] }).__photoSizes.at(-1)!);
  expect(size[0] / (11811 / 100)).toBeCloseTo(4, 3);
  expect(size[1] / (11811 / 100)).toBeCloseTo(6, 3);
  expect(size[0] / size[1]).toBeCloseTo(2 / 3, 8);
  await page.getByRole('button', { name: 'Hapus foto' }).click();
  await expect(button).toBeEnabled();
});

test('long text and invalid photos cannot produce a broken card', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nama lengkap').fill('W'.repeat(80));
  await page.getByRole('textbox', { name: 'Jabatan', exact: true }).fill('W'.repeat(120));
  await uploadFixture(page);
  await expect(page.getByLabel('Nama lengkap')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('textbox', { name: 'Jabatan', exact: true })).toHaveAttribute('aria-invalid', 'true');
  const button = page.getByRole('button', { name: 'Unduh PNG', exact: true });
  await expect(button).toBeDisabled();
  await page.getByLabel('Nama lengkap').fill('Ahmad Fauzi');
  await page.getByRole('textbox', { name: 'Jabatan', exact: true }).fill('Panitia');
  await expect(button).toBeEnabled();
  await page.getByLabel('Nama lengkap').fill('   ');
  await expect(button).toBeDisabled();
  await page.getByRole('button', { name: 'Hapus foto' }).click();
  await page.getByLabel('Unggah foto JPG atau PNG').setInputFiles({ name: 'rusak.png', mimeType: 'image/png', buffer: Buffer.from('not a png') });
  await expect(page.getByRole('alert')).toContainText('bukan gambar');
  await page.getByLabel('Unggah foto JPG atau PNG').setInputFiles({ name: 'besar.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert')).toContainText('melebihi 10 MB');
  await expect(button).toBeDisabled();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Nama lengkap')).toHaveValue('');
});
