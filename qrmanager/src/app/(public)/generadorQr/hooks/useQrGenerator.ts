// src/app/(public)/qr-generator/hooks/useQrGenerator.ts
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  isValidUrl,
  normalizeUrl,
  slugifyUrl,
  downloadCanvas,
  QrFormat,
} from '../utils/qr';

export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  url: string;
  fgColor: string;
  bgColor: string;
  size: number;
  errorCorrection: ErrorCorrection;
  includeMargin: boolean;
  logoUrl: string;
  logoSize: number; // % del QR (8-30)
}

export interface UseQrGeneratorReturn {
  options: QrOptions;
  urlInput: string;
  urlError: string;
  isReady: boolean;
  registerCanvas: (canvas: HTMLCanvasElement | null) => void;
  setUrlInput: (v: string) => void;
  handleUrlBlur: () => void;
  setFgColor: (v: string) => void;
  setBgColor: (v: string) => void;
  setSize: (v: number) => void;
  setErrorCorrection: (v: ErrorCorrection) => void;
  setIncludeMargin: (v: boolean) => void;
  setLogoUrl: (v: string) => void;
  setLogoSize: (v: number) => void;
  applyPreset: (fg: string, bg: string) => void;
  handleDownload: (format: QrFormat) => void;
  handleCopyUrl: () => Promise<void>;
  copied: boolean;
}

const DEFAULTS: QrOptions = {
  url: '',
  fgColor: '#BE2D26',
  bgColor: '#FFFFFF',
  size: 1024,
  errorCorrection: 'H',
  includeMargin: true,
  logoUrl: '/sede.ico',   // logo por defecto desde /public
  logoSize: 20,
};

export function useQrGenerator(): UseQrGeneratorReturn {
  const [options, setOptions] = useState<QrOptions>(DEFAULTS);
  const [urlInput, setUrlInputRaw] = useState('');
  const [urlError, setUrlError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isReady = isValidUrl(options.url);

  /** QrPreview llama esto cuando el canvas está listo */
  const registerCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const setUrlInput = useCallback((v: string) => {
    setUrlInputRaw(v);
    setUrlError('');
    const normalized = normalizeUrl(v);
    if (v.length > 4 && isValidUrl(normalized)) {
      setOptions((prev) => ({ ...prev, url: normalized }));
    } else {
      setOptions((prev) => ({ ...prev, url: '' }));
    }
  }, []);

  const handleUrlBlur = useCallback(() => {
    if (!urlInput.trim()) return;
    const normalized = normalizeUrl(urlInput);
    if (!isValidUrl(normalized)) {
      setUrlError('Ingresa una URL válida (ej: https://www.sucre.gob.bo)');
    } else {
      setUrlError('');
      setOptions((prev) => ({ ...prev, url: normalized }));
    }
  }, [urlInput]);

  const setter =
    <K extends keyof QrOptions>(key: K) =>
    (value: QrOptions[K]) =>
      setOptions((prev) => ({ ...prev, [key]: value }));

  const applyPreset = useCallback((fg: string, bg: string) => {
    setOptions((prev) => ({ ...prev, fgColor: fg, bgColor: bg }));
  }, []);

  const handleDownload = useCallback(
    (format: QrFormat) => {
      const canvas = canvasRef.current;
      if (!canvas || !isReady) return;
      const slug = slugifyUrl(options.url);
      downloadCanvas(canvas, `qr-${slug}`, format, options.size);
    },
    [options.url, options.size, isReady]
  );

  const handleCopyUrl = useCallback(async () => {
    if (!options.url) return;
    try {
      await navigator.clipboard.writeText(options.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [options.url]);

  return {
    options,
    urlInput,
    urlError,
    isReady,
    registerCanvas,
    setUrlInput,
    handleUrlBlur,
    setFgColor: setter('fgColor'),
    setBgColor: setter('bgColor'),
    setSize: setter('size'),
    setErrorCorrection: setter('errorCorrection'),
    setIncludeMargin: setter('includeMargin'),
    setLogoUrl: setter('logoUrl'),
    setLogoSize: setter('logoSize'),
    applyPreset,
    handleDownload,
    handleCopyUrl,
    copied,
  };
}