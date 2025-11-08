import React, { useEffect, useRef } from 'react';
import type {BasicSimulationParams} from './utlis';


const Simulation2D: React.FC<BasicSimulationParams> = ({
    gridSize, 
    initialInfected, 
    infectionChance, 
    recoveryDuration, 
    mortalityChance, 
    immunityDuration,
    onReset
}) => {
    const [deadCount, setDeadCount] = React.useState(0);
    const [infectedCount, setInfectedCount] = React.useState(initialInfected);
    const [frameCount, setFrameCount] = React.useState(0);
    
    const total = gridSize * gridSize;
    const gridRef = useRef<Int16Array | undefined>(undefined);
    const frameIdRef = useRef<number | undefined>(undefined);
    const frameRef = useRef<number>(1);
    const lastFrameTimeRef = useRef<number>(0);
    const countsRef = useRef({ infected: initialInfected, dead: 0 });
    const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    
    const FRAME_INTERVAL = 1000 / 30; // 30 fps = one frame every ~33.33ms
    
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

    useEffect(() => {
        gridRef.current = new Int16Array(total*3);
        const grid = gridRef.current;
        
        for (let i = 0; i < total; i++) {
            grid[i*3] = -1; // infected until
            grid[i*3 + 1] = -1; // immune until
            grid[i*3 + 2] = 0; // is dead
        }
        
        for (let i = 0; i < initialInfected; i++) {
            const id = Math.floor(Math.random() * total);
            grid[id*3] = 1;
        }
        
        countsRef.current = { infected: initialInfected, dead: 0 };
        frameRef.current = 1;
        lastFrameTimeRef.current = performance.now();
        
        setInfectedCount(initialInfected);
        setDeadCount(0);
        setFrameCount(1);

        const loop = (timestamp: number) => {
            // Check if enough time has passed since last frame
            if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) {
                frameIdRef.current = requestAnimationFrame(loop);
                return;
            }
            
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
                        countsRef.current.dead += 1;
                        continue;
                    }
                    grid[i*3] = frameRef.current + recoveryDuration;
                    grid[i*3 + 1] = frameRef.current + recoveryDuration + immunityDuration;
                }
                if (grid[i*3 + 1] >= frameRef.current) {
                    infected += 1;
                }
            }

            countsRef.current.infected = infected;
            
            
            setInfectedCount(countsRef.current.infected);
            setDeadCount(countsRef.current.dead);
            setFrameCount(frameRef.current);

            lastFrameTimeRef.current = timestamp;
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
        <div className='p-4 rounded-2xl bg-white shadow-sm text-center text-black w-80'>
            <p>Total: {total}</p>
            <p>Infected: {infectedCount}</p>
            <p>Dead: {deadCount}</p>
            <p>Frame: {frameCount}</p>
        </div>
    );
}

export default Simulation2D;