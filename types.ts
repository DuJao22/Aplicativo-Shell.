export type FuelType = 'DIESEL' | 'GASOLINA' | 'GASOLINA_ADITIVADA' | 'ETANOL_COMUM' | 'ETANOL_ADITIVADO';

// Structure required by the prompt: Object where keys are tens (0, 10, 20...) and values are arrays of 10 digits
export interface VolumetricTable {
  [key: number]: number[];
}

export interface FuelConfig {
  id: FuelType;
  name: string;
  color: string;
  table: VolumetricTable;
}