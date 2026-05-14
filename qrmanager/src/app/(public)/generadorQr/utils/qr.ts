// src/app/(public)/qr-generator/utils/qr.ts

export function isValidUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function slugifyUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const base = (hostname + pathname)
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 40);
    return base || 'qr-code';
  } catch {
    return 'qr-code';
  }
}

export type QrFormat = 'png' | 'svg' | 'jpeg';

export function downloadCanvas(
  canvasOrSvg: HTMLCanvasElement | SVGSVGElement,
  filename: string,
  format: QrFormat = 'png',
  size: number = 1024
): void {
  if (canvasOrSvg instanceof SVGSVGElement) {
    // SVG download
    const svgData = new XMLSerializer().serializeToString(canvasOrSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Canvas → high-res PNG/JPEG
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const ctx = offscreen.getContext('2d')!;

  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvasOrSvg, 0, 0, size, size);

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  offscreen.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    mimeType,
    0.95
  );
}

export const ERROR_CORRECTION_LABELS: Record<string, string> = {
  L: 'Baja (7%)',
  M: 'Media (15%)',
  Q: 'Alta (25%)',
  H: 'Máxima (30%)',
};

export const SIZE_OPTIONS = [
  { label: '256 px', value: 256 },
  { label: '512 px', value: 512 },
  { label: '768 px', value: 768 },
  { label: '1024 px', value: 1024 },
  { label: '1536 px', value: 1536 },
  { label: '2048 px', value: 2048 },
];

export const PRESET_COLORS = [
  { label: 'Rojo Alcaldía', fg: '#BE2D26', bg: '#FFFFFF' },
  { label: 'Oscuro clásico', fg: '#1E1A18', bg: '#FFFFFF' },
  { label: 'Invertido', fg: '#FFFFFF', bg: '#1E1A18' },
  { label: 'Rojo sobre crema', fg: '#BE2D26', bg: '#F6F4F1' },
  { label: 'Rojo oscuro', fg: '#8C1F1A', bg: '#FBEAE9' },
];