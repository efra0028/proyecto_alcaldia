"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useCamera } from "./useCamera";
import { verificarQr } from "./verificarQr.service";
import type { ScanEstado, VerificacionResult, UseQrScannerReturn } from "../types/scanner.types";

const SCAN_INTERVAL_MS = 300; // how often to sample a frame

export function useQrScanner(): UseQrScannerReturn {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [estado, setEstado] = useState<ScanEstado>("idle");
  const [resultado, setResultado] = useState<VerificacionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Propagate camera errors
  useEffect(() => {
    if (cameraError) {
      setEstado("error");
      setErrorMsg(cameraError);
    }
  }, [cameraError]);

  /** Grabs a frame from the video, decodes with jsQR, then calls the API */
  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Dynamically import jsQR to keep the initial bundle small
    const { default: jsQR } = await import("jsqr");
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (!code) return; // no QR found in this frame

    // QR found → stop scanning, start verifying
    stopScanning();
    setEstado("loading");

    try {
      const result = await verificarQr(code.data);
      setResultado(result);
      setEstado(result.found ? "success" : "not_found");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al verificar el QR.");
      setEstado("error");
    }
  }, [videoRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopCamera();
  }, [stopCamera]);

  const iniciarEscaneo = useCallback(async () => {
    setEstado("scanning");
    setResultado(null);
    setErrorMsg(null);
    await startCamera();
    // Start periodic frame scanning after camera is ready
    intervalRef.current = setInterval(scanFrame, SCAN_INTERVAL_MS);
  }, [startCamera, scanFrame]);

  const detener = useCallback(() => {
    stopScanning();
    setEstado("idle");
  }, [stopScanning]);

  const reiniciar = useCallback(() => {
    setResultado(null);
    setErrorMsg(null);
    setEstado("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    estado,
    resultado,
    errorMsg,
    iniciarEscaneo,
    detener,
    reiniciar,
    videoRef,
    canvasRef,
  };
}
