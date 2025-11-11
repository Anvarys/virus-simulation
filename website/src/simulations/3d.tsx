import React, { useEffect, useRef, useState, type JSX } from 'react';
import type {ThreeDimensionalSimulationParams} from './utlis';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from "@react-three/drei";


const Simulation3D: React.FC<ThreeDimensionalSimulationParams> = ({
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
    opacity,
    cubeSize
}) => {
    const dimensions = 3;

    const initialPropsRef = useRef({
        gridSize,
        initialInfected,
        infectionChance,
        recoveryDuration,
        mortalityChance,
        immunityDuration,
        total: Math.pow(gridSize, dimensions)
    });

    const cellStates = 3;

    const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
    const frameIdRef = useRef<number | undefined>(undefined);
    const frameRef = useRef<number>(0);
    const deadCountRef = useRef(0);
    const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const colorHealthy = getComputedStyle(document.documentElement).getPropertyValue("--healthy").trim()
    const colorInfected = getComputedStyle(document.documentElement).getPropertyValue("--infected").trim()
    const colorDead = getComputedStyle(document.documentElement).getPropertyValue("--dead").trim()

    function getColor(id: number, frame: number) {
        const grid = gridRef.current;
        if (!grid) return colorHealthy;
        if (grid[id*3+2] === 1) {
            return colorDead;
        } else if (grid[id*3] >= frame) {
            return colorInfected;
        } else {
            return colorHealthy;
        }
    }

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
            const frame = frameRef.current

            for (let i = 0; i < props.total; i++) {
                if (grid[i*cellStates+2] === 1) continue;
                if (grid[i*cellStates] >= frame) {
                    if (Math.random() < props.mortalityChance) {
                        grid[i*cellStates+2] = 1;
                        deadCountRef.current += 1;
                        continue;
                    }
                    infected += 1;
                    continue;
                }
                if (grid[i*cellStates] < frame && grid[i*cellStates+1] < frame && Math.random() < get_infection_chance(i, frame)) {
                    grid[i*cellStates] = frame + props.recoveryDuration;
                    grid[i*cellStates + 1] = frame + props.recoveryDuration + props.immunityDuration;
                    infected += 1
                }
            }

            setInfectedCount(infected);
            setDeadCount(deadCountRef.current);
            setFrameCount(frame);

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

    const grid: JSX.Element[] = [];
    
    const props = initialPropsRef.current;
    for (let x = 0; x < props.gridSize; x++) {
        for (let y = 0; y < props.gridSize; y++){
            for (let z = 0; z < props.gridSize; z++){
                grid.push(
                    <mesh key={`${x}-${y}-${z}`} 
                        position={[x-props.gridSize/2+0.5, y-props.gridSize/2+0.5, z-props.gridSize/2+0.5]}
                        castShadow={false}
                        receiveShadow={false}
                    >
                        <boxGeometry args={[cubeSize, cubeSize, cubeSize]}/>
                        <meshStandardMaterial transparent color={getColor(z * props.gridSize * props.gridSize + y * props.gridSize + x, frameRef.current)} depthWrite={false} opacity={opacity}/>
                    </mesh>
                )
            }
        }
    }

    const [zoom, setZoom] = React.useState(() => {
        const containerSize = Math.min(window.innerHeight * 0.6, window.innerHeight * 0.8);
        return containerSize / gridSize;
    });


    const handleResize = () => {
        const containerSize = Math.min(window.innerHeight * 0.6, window.innerHeight * 0.8);
        setZoom(containerSize / gridSize);
        resizeFunc?.();
    };

    window.onresize = handleResize;

    const [hasMoved, setHasMoved] = useState(false);

    return (
        <div className='w-full h-full flex relative'>
            <Canvas dpr={[1, 2]}>
                <OrthographicCamera
                    makeDefault
                    position={[
                        Math.cos(Math.PI / 4.5) * 10, // X = 45° turn around Y
                        Math.sin(Math.PI / 8) * 10, // Y = 22.5° tilt up
                        Math.sin(Math.PI / 4.5) * 10, // Z = 45° turn around Y
                    ]}
                    zoom={zoom}
                    near={0}
                    far={100}
                    
                />
                <ambientLight intensity={1} />
                <OrbitControls enablePan enableRotate enableZoom onChange={() => {setHasMoved(true)}}/>

                {grid}
            </Canvas>
            { !hasMoved &&
            <p className='absolute top-1 left-3 text-neutral-400'>Try rotating camera or zooming</p>
            }
        </div>
    );
}

export default Simulation3D;