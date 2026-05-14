// src/app/resultado/[uuid]/types.ts

export type Resultado = "VALIDO" | "VENCIDO" | "SUSPENDIDO" | "NO_ENCONTRADO";

export interface ScanResponse {
  uuid: string;
  resultado: Resultado;
  estado: { 
    nombre: string; 
    color_hex: string; 
    bloquea_qr: boolean 
  };
  sistema: { 
    nombre: string; 
    descripcion: string; 
    color_hex: string; 
    logo_url?: string 
  };
  registro: {
    datos_display: Record<string, string>;
    fecha_inicio: string;
    fecha_vencimiento: string;
    suspendido_por?: string;
    motivo_suspension?: string;
  };
  scan: { 
    numero: number; 
    ip: string; 
    dispositivo: string 
  };
}

export interface ResultConfig {
  icon: string;
  label: string;
  headerBg: string;
  bodyBg: string;
  borderColor: string;
  badgeText: string;
  scanBg: string;
}