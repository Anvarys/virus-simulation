import React, { useEffect, useRef } from 'react';
import type { AnyDimensionalSimulationParams, ChartDataElement} from './utlis';
import { type ChartConfig, ChartContainer } from "@/components/ui/chart" 
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"


const chartConfig = {
  dead: {
    label: "Dead",
    color: "var(--dead)"
  },
  infected: {
    label: "Infected",
    color: "var(--infected)"
  },
  healthy: {
    label: "Healthy",
    color: "var(--healthy)"
  }
} satisfies ChartConfig


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
  const maxChartData = 500;

  const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
  const frameIdRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number>(0);

  const deadCountRef = useRef(0);
  const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chartData = useRef<ChartDataElement[]>([]);

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

  function addChartData(chartDataElement: ChartDataElement) {
    chartData.current.push(chartDataElement);
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

    if (chartData.current.length < 1){
      addChartData({
        time: 1,
        dead: deadCountRef.current,
        infected: props.initialInfected,
        healthy: props.total - props.initialInfected
      })
    }

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

      addChartData({
        time: frameRef.current,
        dead: deadCountRef.current,
        infected: infected,
        healthy: props.total - deadCountRef.current - infected
      })

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
    <div className='w-full h-full p-8 flex flex-col space-y-8'>
      <ChartContainer className='p-2 h-[50%]' config={chartConfig}>
        <LineChart
        key={frameRef.current}
        accessibilityLayer
        data={chartData.current}
        margin={{}}
        >
          <CartesianGrid vertical={false}/>
          <XAxis
            dataKey="time"
            tickLine={false}
            tickMargin={0}
            startOffset={1}
            interval={Math.max(Math.floor(frameRef.current/15/50)*50-1, 99)}
          />
          <YAxis
            tickLine={false}
          />
          <Line 
            dataKey="dead"
            type="monotone"
            stroke='var(--dead)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="infected"
            type="monotone"
            stroke='var(--infected)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="healthy"
            type="monotone"
            stroke='var(--healthy)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      <ChartContainer className='p-2 h-[calc(50%-2rem)]' config={chartConfig}>
        <LineChart
        key={frameRef.current}
        accessibilityLayer
        data={chartData.current.slice(-maxChartData)}
        margin={{}}
        >
          <CartesianGrid vertical={false}/>
          <XAxis
            dataKey="time"
            tickLine={false}
            tickMargin={0}
            startOffset={1}
            interval={Math.max(Math.floor(frameRef.current/15/50)*50-1, 99)}
          />
          <YAxis
            tickLine={false}
          />
          <Line 
            dataKey="dead"
            type="monotone"
            stroke='var(--dead)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="infected"
            type="monotone"
            stroke='var(--infected)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="healthy"
            type="monotone"
            stroke='var(--healthy)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default SimulationAnyD;