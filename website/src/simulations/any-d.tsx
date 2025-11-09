import React, { useEffect, useRef } from 'react';
import type {AnyDimensionalSimulationParams} from './utlis';


const SimulationAnyD: React.FC<AnyDimensionalSimulationParams> = ({
    gridSize, 
    initialInfected, 
    infectionChance, 
    recoveryDuration, 
    mortalityChance, 
    immunityDuration,
    setInfectedCount,
    setDeadCount, 
    setFrameCount,
    resizeFunc,
    onReset,
    dimensions,
}) => {
    const initialPropsRef = useRef({
        gridSize,
        initialInfected,
        infectionChance,
        recoveryDuration,
        mortalityChance,
        immunityDuration,
        total: Math.pow(gridSize, dimensions),
        dimensions
    });

    const cellStates = 3;
    const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
    const frameIdRef = useRef<number | undefined>(undefined);
    const frameRef = useRef<number>(0);

    const deadCountRef = useRef(0);
    const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    /*
    const colorHealthy = getComputedStyle(document.documentElement).getPropertyValue("--healthy").trim();
    const colorInfected = getComputedStyle(document.documentElement).getPropertyValue("--infected").trim();
    const colorDead = getComputedStyle(document.documentElement).getPropertyValue("--dead").trim();
    */

    function get_infection_chance(id: number, frame: number) {
        const grid = gridRef.current;
        const props = initialPropsRef.current;
        if (!grid) return 0;
        
        let infected_neighbors = 0;
        for (let dim = 0; dim < dimensions; dim++) {
            for (let dir of [-1, 1]) {
                const n_id = id + dir * Math.pow(props.gridSize, dim);
                if (n_id < 0 || n_id >= props.total) continue;

                if (grid[n_id*cellStates] >= frame) {
                    infected_neighbors += 1;
                }
            }
        }
        return 1 - Math.pow(1 - props.infectionChance, infected_neighbors);
    }

    if (frameRef.current === 0) {
        const props = initialPropsRef.current;

        for (let i = 0; i < props.total; i++) {
            gridRef.current[i*cellStates] = -1; // infected until
            gridRef.current[i*cellStates + 1] = -1; // immune until
            gridRef.current[i*cellStates + 2] = 0; // is dead
        }

        for (let i = 0; i < props.initialInfected; i++) {
            const id = Math.floor(Math.random() * props.total);
            gridRef.current[id*cellStates] = props.recoveryDuration;
        }

        deadCountRef.current = 0;
        frameRef.current = 1;
    }

    useEffect(() => {
        const grid = gridRef.current;
        const props = initialPropsRef.current;

        const loop = () => {
            let infected = 0;
            for (let i = 0; i < props.total; i++) {
                if (grid[i*cellStates+2] === 1) continue;
                if (grid[i*cellStates] >= frameRef.current) {
                    infected += 1;
                    continue;
                }
                if (grid[i*cellStates+1] < frameRef.current && Math.random() < get_infection_chance(i, frameRef.current)) {
                    if (Math.random() < props.mortalityChance) {
                        grid[i*cellStates+2] = 1;
                        deadCountRef.current += 1;
                        continue;
                    }
                    grid[i*cellStates] = frameRef.current + props.recoveryDuration;
                    grid[i*cellStates + 1] = frameRef.current + props.recoveryDuration + props.immunityDuration;
                }
                if (grid[i*cellStates + 1] >= frameRef.current) {
                    infected += 1;
                }
            }

            setInfectedCount(infected);
            setDeadCount(deadCountRef.current);
            setFrameCount(frameRef.current);

            frameRef.current += 1;
            if (infected !== 0) {
                frameIdRef.current = requestAnimationFrame(loop);
            }
        };

        frameIdRef.current = requestAnimationFrame(loop);

        onReset?.();
        
        return () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            if (updateDisplayRef.current) clearTimeout(updateDisplayRef.current);
        };
    }, []);

    const handleResize = () => {
        resizeFunc?.();
    };

    window.onresize = handleResize;

    return (
        <>
        </>
    );
}

export default SimulationAnyD;