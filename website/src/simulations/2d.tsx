import React, { useEffect, useRef, type JSX } from 'react';
import type {BasicSimulationParams, Virus} from './utlis';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from "@react-three/drei";


const Simulation2D: React.FC<BasicSimulationParams> = ({
  gridSize, 
  initialInfected, 
  viruses,
  setInfectedCount,
  setDeadCount,
  setFrameCount,
  resizeFunc,
  onReset,
}) => {
  const dimensions = 2;

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
      grid.push(
        <mesh key={`${x}-${y}`} position={[x-props.gridSize/2+0.5, y-props.gridSize/2+0.5, 0]}>
          <planeGeometry args={[1,1]}/>
          <meshStandardMaterial color={
            getColor(x + y * props.gridSize, frameRef.current)
          }/>
        </mesh>
      )
    }
  }

  const [zoom, setZoom] = React.useState(() => {
    const containerSize = Math.min(window.innerHeight * 0.6, window.innerHeight * 0.8);
    return containerSize / gridSize * 1.6;
  });


  const handleResize = () => {
    const containerSize = Math.min(window.innerHeight * 0.6, window.innerHeight * 0.8);
    setZoom(containerSize / gridSize * 1.6);
    resizeFunc?.();
  };

  window.onresize = handleResize;

  const aspect = 1;

  return (
    <Canvas>
      <OrthographicCamera
        key={zoom}
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