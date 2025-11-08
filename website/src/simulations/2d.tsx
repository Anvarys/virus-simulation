import React, { useEffect, useRef } from 'react';
import type {BasicSimulationParams} from './utlis';


const Simulation2D: React.FC<BasicSimulationParams> = ({
    gridSize, 
    initialInfected, 
    infectionChance, 
    recoveryDuration, 
    mortalityChance, 
    immunityDuration,
    setInfectedCount,
    setDeadCount,
    setFrameCount,
    onReset
}) => {
    const total = gridSize * gridSize;
    const gridRef = useRef<Int16Array>(new Int16Array(total*3));
    const frameIdRef = useRef<number | undefined>(undefined);
    const frameRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const deadCountRef = useRef(0);
    const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
    ];

    function idx(id: number): [number, number] {
        return [id % gridSize, Math.floor(id / gridSize)];
    }

    function get_infection_chance(x: number, y: number, frame: number) {
        const grid = gridRef.current;
        if (!grid) return 0;
        
        let infected_neighbors = 0;
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                const n_id = (ny * gridSize + nx) * 3;
                if (grid[n_id] >= frame && grid[n_id+2] === 0 && grid[n_id] !== frame + recoveryDuration + immunityDuration) {
                    infected_neighbors += 1;
                }
            }
        }
        return 1 - Math.pow(1 - infectionChance, infected_neighbors);
    }

    if (frameRef.current === 0) {

        for (let i = 0; i < total; i++) {
            gridRef.current[i*3] = -1; // infected until
            gridRef.current[i*3 + 1] = -1; // immune until
            gridRef.current[i*3 + 2] = 0; // is dead
        }

        for (let i = 0; i < initialInfected; i++) {
            const id = Math.floor(Math.random() * total);
            gridRef.current[id*3] = recoveryDuration;
        }

        deadCountRef.current = 0;
        frameRef.current = 1;
    }

    useEffect(() => {
        const grid = gridRef.current;
        lastFrameTimeRef.current = performance.now();

        const loop = () => {
            let infected = 0;
            for (let i = 0; i < total; i++) {
                if (grid[i*3+2] === 1) continue;
                if (grid[i*3] >= frameRef.current) {
                    infected += 1;
                    continue;
                }
                if (Math.random() < get_infection_chance(...idx(i), frameRef.current)) {
                    if (Math.random() < mortalityChance) {
                        grid[i*3+2] = 1;
                        deadCountRef.current += 1;
                        continue;
                    }
                    grid[i*3] = frameRef.current + recoveryDuration;
                    grid[i*3 + 1] = frameRef.current + recoveryDuration + immunityDuration;
                }
                if (grid[i*3 + 1] >= frameRef.current) {
                    infected += 1;
                }
            }

            setInfectedCount(infected);
            setDeadCount(deadCountRef.current);
            setFrameCount(frameRef.current);

            frameRef.current += 1;
            frameIdRef.current = requestAnimationFrame(loop);
        };

        frameIdRef.current = requestAnimationFrame(loop);
        
        onReset?.();
        
        return () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            if (updateDisplayRef.current) clearTimeout(updateDisplayRef.current);
        };
    }, [gridSize, initialInfected, infectionChance, recoveryDuration, mortalityChance, immunityDuration, total]);

    return (
        <></>
    );
}

export default Simulation2D;