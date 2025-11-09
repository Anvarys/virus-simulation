import React, { useEffect, useRef, type JSX } from 'react';
import type {BasicSimulationParams} from './utlis';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from "@react-three/drei";


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
    const initialPropsRef = useRef({
        gridSize,
        initialInfected,
        infectionChance,
        recoveryDuration,
        mortalityChance,
        immunityDuration,
        total: gridSize * gridSize
    });

    const cellStates = 3;
    const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
    const frameIdRef = useRef<number | undefined>(undefined);
    const frameRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const deadCountRef = useRef(0);
    const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const colors = [
        "#001ac0", // Alive not infected
        "#00ff00", // Infected
        "#ca0000", // Dead
    ];
    
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
    ];

    function idx(id: number): [number, number] {
        return [id % initialPropsRef.current.gridSize, Math.floor(id / initialPropsRef.current.gridSize)];
    }

    function getColor(x: number, y: number, frame: number) {
        const grid = gridRef.current;
        const props = initialPropsRef.current;
        if (!grid) return colors[0];
        const id = (y * props.gridSize + x) * cellStates;
        if (grid[id+2] === 1) {
            return colors[2];
        } else if (grid[id] >= frame) {
            return colors[1];
        } else {
            return colors[0];
        }
    }

    function get_infection_chance(x: number, y: number, frame: number) {
        const grid = gridRef.current;
        const props = initialPropsRef.current;
        if (!grid) return 0;
        
        let infected_neighbors = 0;
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < props.gridSize && ny >= 0 && ny < props.gridSize) {
                const n_id = (ny * props.gridSize + nx) * cellStates;
                if (grid[n_id] >= frame && grid[n_id+2] === 0 && grid[n_id] !== frame + props.recoveryDuration + props.immunityDuration) {
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
        lastFrameTimeRef.current = performance.now();

        const loop = () => {
            let infected = 0;
            for (let i = 0; i < props.total; i++) {
                if (grid[i*cellStates+2] === 1) continue;
                if (grid[i*cellStates] >= frameRef.current) {
                    infected += 1;
                    continue;
                }
                if (Math.random() < get_infection_chance(...idx(i), frameRef.current)) {
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
            frameIdRef.current = requestAnimationFrame(loop);
        };

        frameIdRef.current = requestAnimationFrame(loop);
        
        onReset?.();
        
        return () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            if (updateDisplayRef.current) clearTimeout(updateDisplayRef.current);
        };
    }, []);

    const grid: JSX.Element[] = [];
    
    const props = initialPropsRef.current;
    for (let x = 0; x < props.gridSize; x++) {
        for (let y = 0; y < props.gridSize; y++){
            grid.push(
                <mesh key={`${x}-${y}`} position={[x-props.gridSize/2+0.5, y-props.gridSize/2+0.5, 0]}>
                    <planeGeometry args={[1,1]}/>
                    <meshStandardMaterial color={
                        getColor(x, y, frameRef.current)
                    }/>
                </mesh>
            )
        }
    }

    const [zoom, setZoom] = React.useState(() => {
        const containerSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
        return containerSize / gridSize;
    });

    React.useEffect(() => {
        const handleResize = () => {
            const containerSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
            setZoom(containerSize / gridSize);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gridSize]);

    const aspect = window.innerWidth / window.innerHeight;

    return (
        <Canvas>
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                zoom={zoom}
                near={0.1}
                far={100}
                args={[-aspect * zoom, aspect * zoom, zoom, -zoom, 0.1, 100]}
            />
            <ambientLight intensity={1} />
            {grid}
        </Canvas>
    );
}

export default Simulation2D;