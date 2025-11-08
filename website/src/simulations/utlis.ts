export interface BasicSimulationParams {
    gridSize: number;
    initialInfected: number;
    infectionChance: number;
    recoveryDuration: number;
    mortalityChance: number;
    immunityDuration: number;
    onReset?: () => void;
}