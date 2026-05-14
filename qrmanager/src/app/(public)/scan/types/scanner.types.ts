export type ScanEstado = "idle" | "scanning" | "loading" | "success" | "error" | "not_found";

export interface QrRegistro {
  id: string;
  sistema_id: string;
  referencia_externa: string;
  datos_display: Record<string, string>;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado_id: number;
  estado_nombre?: string;
  codigo_qr?: string;
}

export interface VerificacionResult {
  found: boolean;
  registro?: QrRegistro;
  mensaje?: string;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export interface UseQrScannerReturn {
  estado: ScanEstado;
  resultado: VerificacionResult | null;
  errorMsg: string | null;
  iniciarEscaneo: () => void;
  detener: () => void;
  reiniciar: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
