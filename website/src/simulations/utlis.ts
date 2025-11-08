export interface BasicSimulationParams {
    gridSize: number;
    initialInfected: number;
    infectionChance: number;
    recoveryDuration: number;
    mortalityChance: number;
    immunityDuration: number;
    setInfectedCount: (count: number) => void;
    setDeadCount: (count: number) => void;
    setFrameCount: (count: number) => void;
    onReset?: () => void;
}