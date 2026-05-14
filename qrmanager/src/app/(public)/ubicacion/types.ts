// src/app/ubicacion/types.ts

export interface Office {
  id: number;
  name: string;
  dept: string;
  address: string;
  reference?: string;
  hours: string;
  phone: string;
  isMain?: boolean;
}

export interface OfficeHour {
  day: string;
  time: string;
}

export interface Transport {
  icon: string;
  name: string;
  desc: string;
}