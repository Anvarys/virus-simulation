import React, { useEffect, useRef, useState } from 'react';
import type { AnyDimensionalSimulationParams, ChartDataElement, Virus} from '@/utlis';
import { type ChartConfig, ChartContainer } from "@/components/ui/chart" 
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import InfoIcon from '@/components/icons/InfoIcon';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type ColumnDef, type ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faArrowDownUpAcrossLine } from '@fortawesome/free-solid-svg-icons';

type DataRow = {
  name: string
  deaths: number
}

interface DataTableParams {
  data: DataRow[]
}


const DataTable: React.FC<DataTableParams> = ({data}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<DataRow>[] = [
    {
      accessorKey: "name",
      header: "Name"
    },
    {
      accessorKey: "deaths",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc" ? true : (column.getIsSorted() == false))}
          >
            Deaths
            <FontAwesomeIcon icon={column.getIsSorted() === "asc" ? faArrowUp : (column.getIsSorted() ? faArrowDown : faArrowDownUpAcrossLine)} />
          </Button>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border border-neutral-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={data.length}
                  className="h-24 text-center"
                >
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className='text-neutral-950'
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className='text-neutral-950'
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}


const chartConfig = {
  dead: {
    label: "Dead",
    color: "var(--dead)"
  },
  infectedTotal: {
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
  viruses,
  advancedMode,
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
    total: Math.pow(gridSize, dimensions),
    dimensions
  });

  const virusesRef = useRef<Virus[]>(viruses);

  const cellStates = 4;
  const maxChartData = 500;

  const gridRef = useRef<Int16Array>(new Int16Array(initialPropsRef.current.total*cellStates));
  const frameIdRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number>(0);

  const deadCountRef = useRef(0);
  const updateDisplayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chartDataRef = useRef<ChartDataElement[]>([]);
  
  const chartSettingsRef = useRef<string[]>(
    JSON.parse(localStorage.getItem("chartSettings") ?? JSON.stringify(["healthy","dead","infectedTotal"]))
  )

  const [updateChartLines, setUpdateChartLines] = useState(0);

  const deathsByVirusRef = useRef<DataRow[]>([]);

  const [showingMoreData, setShowingMoreData] = useState(false);

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

  function addChartData(chartDataElement: ChartDataElement) {
    chartDataRef.current.push(chartDataElement);
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

      deathsByVirusRef.current.push({name: virus.name, deaths: 0})
    }

    deadCountRef.current = 0;
    frameRef.current = 1;
  }

  useEffect(() => {
    const grid = gridRef.current;
    const props = initialPropsRef.current;

    const loop = () => { 
      let infectedTotal = 0;
      const frame = frameRef.current
      const viruses = virusesRef.current

      const infected: { [key: number]: number } = {};
      for (let i = 0; i < viruses.length; i++) {
        infected[i] = 0;
      }

      for (let i = 0; i < props.total; i++) {
        if (grid[i*cellStates+2] === 1) continue;
        if (grid[i*cellStates] >= frame) {
          if (Math.random() < viruses[grid[i*cellStates+3]].mortalityChance) {
            grid[i*cellStates+2] = 1;
            deadCountRef.current += 1;
            deathsByVirusRef.current[grid[i*cellStates+3]].deaths += 1;
            continue;
          }
          infectedTotal += 1;
          infected[grid[i*cellStates+3]] += 1
          continue;
        }
        if (grid[i*cellStates] < frame && grid[i*cellStates+1] < frame && get_infected(i, frameRef.current)) {
          infectedTotal += 1
          infected[grid[i*cellStates+3]] += 1
        }
      }
      

      setInfectedCount(infectedTotal);
      setDeadCount(deadCountRef.current);
      setFrameCount(frame);

      addChartData({
        time: frameRef.current,
        dead: deadCountRef.current,
        infectedTotal: infectedTotal,
        healthy: props.total - deadCountRef.current - infectedTotal,
        infected: infected
      })
      frameRef.current += 1;
      if (infectedTotal !== 0) {
        frameIdRef.current = requestAnimationFrame(loop);
      } else {
        frameRef.current = -1;
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

  const handleGroupToggleValueChange = (value: string[]) => {
    if (value.length > 0){
      chartSettingsRef.current = value
    } else if (!advancedMode) {
      toast.error("You need to choose at least one value")
    }
    if (frameRef.current < 0) {
      setUpdateChartLines(1-updateChartLines)
    }
    localStorage.setItem("chartSettings",JSON.stringify(chartSettingsRef.current))
  }

  window.onresize = handleResize;

  return (
    <div className='w-full h-full p-8 pl-2 flex flex-col relative'>
      { frameRef.current === -1 &&
        <Button className='absolute bottom-4 right-4' onClick={() => {setShowingMoreData(true)}}>Show more data</Button>
      }
      <ToggleGroup type='multiple' variant="outline" spacing={2} size="sm"
        value={chartSettingsRef.current} onValueChange={handleGroupToggleValueChange}
        className='h-min ml-10 mb-3 flex flex-wrap'
        >
          <div className='mr-2 flex flex-row space-x-2'>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon color="white" width='1rem' height='1rem'/>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-center'>Toggles for different stats on<br/>charts, those random like toggles<br/>are for different virus types</p>
              </TooltipContent>
            </Tooltip>
            <Label className=''>Toggles:</Label>
          </div>
        { virusesRef.current.length > 1 &&
        virusesRef.current.map((virus) =>
        <ToggleGroupItem
          value={virus.name}
          className="border-neutral-100 
            data-[state=on]:bg-[var(--color)] 
            hover:data-[state=on]:bg-[var(--color)] 
            hover:bg-[var(--color)] 
            hover:text-neutral-100 
            data-[state=on]:text-neutral-100 
            data-[state=on]:border-[var(--color)] 
            hover:border-[var(--color)]
            opacity-90
            hover:opacity-100"
          style={{ "--color": virus.color} as React.CSSProperties}
        >
          {virus.name}
        </ToggleGroupItem>
        )
        }
        <ToggleGroupItem
          value='infectedTotal'
          className='border-neutral-100 data-[state=on]:bg-[var(--infected)] hover:data-[state=on]:bg-[var(--infected-lighter)] 
          hover:bg-[var(--infected-lighter)] hover:text-neutral-100 data-[state=on]:text-neutral-100 
          data-[state=on]:border-[var(--infected-lighter)] hover:border-[var(--infected-lighter)]'
        >
          Total infected
        </ToggleGroupItem>
        <ToggleGroupItem
          value='dead'
          className='border-neutral-100 data-[state=on]:bg-[var(--dead)] hover:data-[state=on]:bg-[var(--dead-lighter)] 
          hover:bg-[var(--dead-lighter)] hover:text-neutral-100 data-[state=on]:text-neutral-100 
          data-[state=on]:border-[var(--dead-lighter)] hover:border-[var(--dead-lighter)]'
        >
          Dead
        </ToggleGroupItem>
        <ToggleGroupItem
          value='healthy'
          className='border-neutral-100 data-[state=on]:bg-[var(--healthy)] hover:data-[state=on]:bg-[var(--healthy-lighter)] 
          hover:bg-[var(--healthy-lighter)] hover:text-neutral-100 data-[state=on]:text-neutral-100 
          data-[state=on]:border-[var(--healthy-lighter)] hover:border-[var(--healthy-lighter)]'
        >
          Healthy
        </ToggleGroupItem>

        <Toggle onPressedChange={(pressed) => {
          if (pressed) {
            chartSettingsRef.current = ["healthy","dead","infectedTotal",...virusesRef.current.map((virus) => virus.name)]
          } else {
            chartSettingsRef.current = []
          }
          localStorage.setItem("chartSettings",JSON.stringify(chartSettingsRef.current))
        }} className='border-yellow-500 border data-[state=on]:bg-yellow-600 hover:data-[state=on]:bg-yellow-500
          hover:bg-yellow-500 hover:text-neutral-100 data-[state=on]:text-neutral-100 
          data-[state=on]:border-yellow-500 hover:border-yellow-500'>
          All
        </Toggle>
      </ToggleGroup>
      <div className='flex flex-col flex-1 w-full h-full min-h-0'>
      <ChartContainer className='p-2 w-full flex-1 min-h-0' config={chartConfig}>
        <LineChart
        key={frameRef.current+updateChartLines}
        accessibilityLayer
        data={chartDataRef.current}
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
          { chartSettingsRef.current.includes("dead") &&
          <Line 
            dataKey="dead"
            type="monotone"
            stroke='var(--dead)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
          { chartSettingsRef.current.includes("infectedTotal") &&
          <Line
            dataKey="infectedTotal"
            type="monotone"
            stroke='var(--infected)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
          { virusesRef.current.length > 1 &&
          virusesRef.current.map((virus, id) => {
            if (!chartSettingsRef.current.includes(virus.name)) {return};
            return (<Line
              dataKey={`infected.${id}`}
              type="monotone"
              stroke={virus.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />)
          })}
          { chartSettingsRef.current.includes("healthy") &&
          <Line
            dataKey="healthy"
            type="monotone"
            stroke='var(--healthy)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
        </LineChart>
      </ChartContainer>
      <ChartContainer className='p-2 w-full flex-1 min-h-0' config={chartConfig}>
        <LineChart
        key={frameRef.current+updateChartLines}
        accessibilityLayer
        data={chartDataRef.current.slice(-maxChartData)}
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
          { chartSettingsRef.current.includes("dead") &&
          <Line 
            dataKey="dead"
            type="monotone"
            stroke='var(--dead)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
          { virusesRef.current.length > 1 &&
          virusesRef.current.map((virus, id) => {
            if (!chartSettingsRef.current.includes(virus.name)) {return};
            return (<Line
              dataKey={`infected.${id}`}
              type="monotone"
              stroke={virus.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />)
          })}
          { chartSettingsRef.current.includes("infectedTotal") &&
          <Line
            dataKey="infectedTotal"
            type="monotone"
            stroke='var(--infected)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
          { chartSettingsRef.current.includes("healthy") &&
          <Line
            dataKey="healthy"
            type="monotone"
            stroke='var(--healthy)'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          }
        </LineChart>
      </ChartContainer>
      </div>

      <Dialog open={showingMoreData} onOpenChange={setShowingMoreData}>
        <DialogContent className='bg-neutral-900 border-neutral-800 p-12 text-neutral-100'>
          <Label>Additional data on viruses</Label>
          <DataTable data={deathsByVirusRef.current}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SimulationAnyD;