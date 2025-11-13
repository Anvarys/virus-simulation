export interface BasicSimulationParams {
    gridSize: number;
    initialInfected: number;
    viruses: Virus[];
    setInfectedCount: (count: number) => void;
    setDeadCount: (count: number) => void;
    setFrameCount: (count: number) => void;
    resizeFunc?: () => void;
    onReset?: () => void;
}

export interface AnyDimensionalSimulationParams extends BasicSimulationParams {
    dimensions: number;
}

export interface ThreeDimensionalSimulationParams extends BasicSimulationParams {
    opacity: number;
    cubeSize: number;
}

export interface ChartDataElement {
    time: number;
    dead: number;
    infected: { [key: number]: number };
    healthy: number;
    infectedTotal: number
}

export type Virus = {
    infectionChance: number;
    recoveryDuration: number;
    mortalityChance: number;
    immunityDuration: number;
    color: string;
    name: string;
}

type RGB = {
  r: number;
  g: number;
  b: number;
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};