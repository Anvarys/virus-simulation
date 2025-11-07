import React, { useEffect, useRef } from 'react';
import type {BasicSimulationParams} from './utlis';

const Simulation2D: React.FC<BasicSimulationParams> = ({gridSize, initialInfected, infectionChance, recoveryDuration, mortalityChance, immunityDuration}) => {

    const total = gridSize * gridSize;
    const grid = new Int16Array(total*3);

    function idx(x: number, y: number) {
        return (y * gridSize + x)*3;
    }

    for (let i = 0; i < total; i++) {
        grid[i*3] = -1;
        grid[i*3 + 1] = -1;
        grid[i*3 + 2] = 0;
    }

    useEffect(() => {
        let frameId: number;

        const loop = () => {

        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    })

    return (
        <div className='relative min-h-[100dvh] flex flex-col items-center justify-center bg-indigo-700 text-white text-5xl'>
            <h1>2D Simulation WIP</h1>
        </div>
    )
}

export default Simulation2D;

