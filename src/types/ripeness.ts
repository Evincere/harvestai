export enum RipenessLevel {
  EARLY = 'Early',
  MID = 'Mid',
  LATE = 'Late',
  UNKNOWN = 'Unknown'
}

export interface RipenessCharacteristics {
  pistils: string;
  trichomes: string;
  leafColor: string;
  recommendedAction: string;
}

export const RIPENESS_CRITERIA: Record<RipenessLevel, RipenessCharacteristics> = {
  [RipenessLevel.EARLY]: {
    pistils: "Mayoría de pistils blancos y erectos",
    trichomes: "Trichomas principalmente transparentes",
    leafColor: "Hojas verde brillante",
    recommendedAction: "Continuar el ciclo de crecimiento"
  },
  [RipenessLevel.MID]: {
    pistils: "50-70% de pistils marrones/naranjas",
    trichomes: "Mezcla de trichomas transparentes y lechosos",
    leafColor: "Hojas comenzando a amarillear",
    recommendedAction: "Monitorear diariamente"
  },
  [RipenessLevel.LATE]: {
    pistils: "80%+ de pistils marrones/naranjas",
    trichomes: "Mayoría de trichomas ámbar",
    leafColor: "Hojas amarillentas",
    recommendedAction: "Considerar cosecha inmediata"
  },
  [RipenessLevel.UNKNOWN]: {
    pistils: "No determinado",
    trichomes: "No determinado",
    leafColor: "No determinado",
    recommendedAction: "Revisar calidad de imagen"
  }
};