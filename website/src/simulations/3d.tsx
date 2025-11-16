import React, { useEffect, useRef, useState, type JSX } from 'react';
import type {ThreeDimensionalSimulationParams, Virus} from '@/utlis';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from "@react-three/drei";


const Simulation3D: React.FC<ThreeDimensionalSimulationParams> = ({
  gridSize, 
  initialInfected, 
  viruses,
  pausedRef,
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
    total: Math.pow(gridSize, dimensions)
  });

  const virusesRef = useRef<Virus[]>(viruses);

  const cellStates = 4;

  const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
  const frameIdRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number>(0);
  const deadCountRef = useRef(0);
  const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const colorHealthy = getComputedStyle(document.documentElement).getPropertyValue("--healthy").trim()
  const colorDead = getComputedStyle(document.documentElement).getPropertyValue("--dead").trim()

  function getColor(id: number, frame: number) {
    const grid = gridRef.current;
    if (!grid) return colorHealthy;
    if (grid[id*cellStates+2] === 1) {
      return colorDead;
    } else if (grid[id*cellStates] >= frame) {
      return virusesRef.current[grid[id*cellStates+3]].color;
    } else {
      return colorHealthy;
    }
  }

  const dirs = [[-1, 1], [1, -1]]

  function get_infected(id: number, frame: number) {
    const grid = gridRef.current;
    const props = initialPropsRef.current;
    const viruses = virusesRef.current;

    const dimDir = ( Math.random() * 2 | 0 )
    for (let _dim = 0; _dim < dimensions; _dim++) {
      const dim = dimDir ? _dim : dimensions - _dim;
      for (let dir of dirs[Math.random() * 2 | 0]) {
        const n_id = id + dir * Math.pow(props.gridSize, dim);
        if (n_id < 0 || n_id >= props.total) continue;
        if (grid[n_id*cellStates] >= frame) {
          const virus = viruses[grid[n_id*cellStates+3]];
          if (Math.random() < virus.infectionChance) {
            grid[id*cellStates] = frame + virus.recoveryDuration;
            grid[id*cellStates + 1] = frame + virus.recoveryDuration + virus.immunityDuration;
            grid[id*cellStates + 3] = grid[n_id*cellStates+3]
            return true;
          }
        }
      }
    }

    return false;
  }

  if (frameRef.current === 0) {
    const props = initialPropsRef.current;

    for (let i = 0; i < props.total; i++) {
      gridRef.current[i*cellStates] = -1; // infected until
      gridRef.current[i*cellStates + 1] = -1; // immune until
      gridRef.current[i*cellStates + 2] = 0; // is dead
      gridRef.current[i*cellStates + 3] = -1; // current virus id
    }

    for (const [vid, virus] of virusesRef.current.entries()) {
      for (let i = 0; i < props.initialInfected; i++) {
        const id = Math.floor(Math.random() * props.total);
        gridRef.current[id*cellStates] = virus.recoveryDuration;
        gridRef.current[id*cellStates + 3] = vid
      }
    }

    deadCountRef.current = 0;
    frameRef.current = 1;
  }

  useEffect(() => {
    const grid = gridRef.current;
    const props = initialPropsRef.current;

    const loop = () => {
      if (pausedRef.current) {
        frameIdRef.current = requestAnimationFrame(loop);
        return
      }

      let infected = 0;
      const frame = frameRef.current
      const viruses = virusesRef.current

      for (let i = 0; i < props.total; i++) {
        if (grid[i*cellStates+2] === 1) continue;
        if (grid[i*cellStates] >= frame) {
          if (Math.random() < viruses[grid[i*cellStates+3]].mortalityChance) {
            grid[i*cellStates+2] = 1;
            deadCountRef.current += 1;
            continue;
          }
          infected += 1;
          continue;
        }
        if (grid[i*cellStates] < frame && grid[i*cellStates+1] < frame && get_infected(i, frameRef.current)) {
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
          near={-10}
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