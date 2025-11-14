import { virusPresets } from "./viruses/presets";

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

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export interface VirusEditorParams {
    virusesRef: React.RefObject<Virus[]>;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export interface VirusCardParams {
    virus: Virus;
    id: number;
    editFunc: (id: number) => void;
    deleteFunc: (id: number) => void;
}


export function saveVirusesToLocal(viruses: Virus[]) {
    localStorage.setItem("viruses", JSON.stringify(viruses))
}

export function getVirusesFromLocal(): Virus[] {
    const viruses = localStorage.getItem("viruses")
    if (!viruses || viruses == "") {return [virusPresets.default]}
    return JSON.parse(viruses) as Virus[]
}