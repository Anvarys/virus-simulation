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
    infected: number;
    healthy: number;
}