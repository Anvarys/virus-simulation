import './App.css'
import React from 'react'
import Simulation2D from './simulations/2d';
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InfoIcon from '@/components/icons/InfoIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import SimulationAnyD from '@/simulations/any-d';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function App() {
  const defaultSettings = {
    gridSize: 20,
    initialInfected: 4,
    infectionChance: 20,
    mortalityChance: 2,
    recoveryDuration: 10,
    immunityDuration: 4,
    dimensions: 2,
  };

  const [resetKey, setResetKey] = React.useState(0);
  const [gridSize, setGridSize] = React.useState(() => {
    return Number(localStorage.getItem('gridSize')) || defaultSettings.gridSize;
  });
  const [initialInfected, setInitialInfected] = React.useState(() => {
    return Number(localStorage.getItem('initialInfected')) || defaultSettings.initialInfected;
  });
  const [infectionChance, setInfectionChance] = React.useState(() => {
    return Number(localStorage.getItem('infectionChance')) || defaultSettings.infectionChance;
  });
  const [mortalityChance, setMortalityChance] = React.useState(() => {
    return Number(localStorage.getItem('mortalityChance')) || defaultSettings.mortalityChance;
  });
  const [recoveryDuration, setRecoveryDuration] = React.useState(() => {
    return Number(localStorage.getItem('recoveryDuration')) || defaultSettings.recoveryDuration;
  });
  const [immunityDuration, setImmunityDuration] = React.useState(() => {
    return Number(localStorage.getItem('immunityDuration')) || defaultSettings.immunityDuration;
  });
  const [dimensions, setDimensions] = React.useState(() => {
    return Number(localStorage.getItem('dimensions')) || defaultSettings.dimensions;
  });
  const [restartOnUpdate, setRestartOnUpdate] = React.useState(() => {
    return Boolean(localStorage.getItem('restartOnUpdate')) || false;
  });

  const [gridSizeUnchanged, setGridSizeUnchanged] = React.useState(() => {
    return gridSize;
  });
  const [dimensionsUnchanged, setDimensionsUnchanged] = React.useState(() => {
    return dimensions;
  });

  const statsRef = React.useRef<HTMLDivElement | null>(null);
  const [statsIsRow, setStatsIsRow] = React.useState(false);

  const simulationType = React.useRef(localStorage.getItem('simulationType') || "");

  const initialInfectedPercentage = 0.1;

  const totalLimitLog = Math.log(100000);

  React.useEffect(() => {
    localStorage.setItem('gridSize', String(gridSize));
    localStorage.setItem('initialInfected', String(initialInfected));
    localStorage.setItem('infectionChance', String(infectionChance));
    localStorage.setItem('mortalityChance', String(mortalityChance));
    localStorage.setItem('recoveryDuration', String(recoveryDuration));
    localStorage.setItem('immunityDuration', String(immunityDuration));
    localStorage.setItem('dimensions', String(dimensions));
  }, [gridSize, initialInfected, infectionChance, mortalityChance, recoveryDuration, immunityDuration, dimensions]);

  const [deadCount, setDeadCount] = React.useState(0);
  const [infectedCount, setInfectedCount] = React.useState(0);
  const [frameCount, setFrameCount] = React.useState(0);

  const [isLauched, setIsLaunched] = React.useState(true);

  React.useEffect(() => {
    if (simulationType.current !== "") {
      setIsLaunched(false);
    }
  }, []);

  const handleReset = () => {
    setGridSizeUnchanged(gridSize);
    setDimensionsUnchanged(dimensions);
    setResetKey(prev => prev + 1);
  };

  const handleResetSettings = () => {
    setGridSize(defaultSettings.gridSize);
    setInitialInfected(defaultSettings.initialInfected);
    setInfectionChance(defaultSettings.infectionChance);
    setMortalityChance(defaultSettings.mortalityChance);
    setRecoveryDuration(defaultSettings.recoveryDuration);
    setImmunityDuration(defaultSettings.immunityDuration);
    setDimensions(defaultSettings.dimensions);
  };

  const handleSetGridSize = (size: number) => {
    setGridSize(size);
    const initialInfectedlimit = Math.floor(Math.pow(gridSize, dimensions) * initialInfectedPercentage)+1;
    if (initialInfected > initialInfectedlimit)
    {
      setInitialInfected(initialInfectedlimit);
    }

    const dimensionsLimit = Math.floor(totalLimitLog / Math.log(size));
    if (dimensions > dimensionsLimit) {
      setDimensions(dimensionsLimit);
    }
  }

  const handleSetSimulationType = (type: string) => {
    simulationType.current = type;
    localStorage.setItem('simulationType', type);
    handleReset();
  }

  const handleSetSettings = (setter: (value: number) => void, value: number) => {
    setter(value);
    if (restartOnUpdate) {
      handleReset();
    }
  }
  
  const handleLaunch = () => {
    setIsLaunched(true);
  }

  const handleResize = () => {
    const statsElement = statsRef.current;
    if (statsElement) {
      const rect = statsElement.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        setStatsIsRow(false);
      }
      else if (rect.bottom > window.innerHeight) {
        setStatsIsRow(true);
      }
    }
  }

  window.onresize = handleResize;

  React.useEffect(() => {
    handleResize();
  }, []);

  return (
    <div className='min-h-[100dvh] min-w-full flex items-center p-[2dvh] bg-neutral-900'>
      <div className='flex gap-8 w-full max-w-[96dvw] h-[96dvh]'>
        {/* Simulation Area */}
        <Card className="flex-1 aspect-square bg-neutral-800 p-0 overflow-hidden max-h-full min-w-[96dvh] max-w-[96dvh]">
          <div className="w-full h-full flex items-center justify-center aspect-square">
            { !isLauched &&
              <Button 
                onClick={handleLaunch}
              >
                Launch Simulation
              </Button>
            }
            { simulationType.current === "" && isLauched &&
              <Label className='text-white'>Please choose a simulation to run</Label>
            }
            { (simulationType.current === "2d" && isLauched)  &&
            <Simulation2D 
              key={resetKey}
              gridSize={gridSize}
              initialInfected={initialInfected} 
              infectionChance={infectionChance / 100}
              immunityDuration={immunityDuration} 
              recoveryDuration={recoveryDuration} 
              mortalityChance={mortalityChance / 100} 
              setInfectedCount={setInfectedCount}
              setDeadCount={setDeadCount}
              setFrameCount={setFrameCount}
              resizeFunc={handleResize}
            />
            }

            { (simulationType.current === "3d" && isLauched) &&
            <Label className='text-neutral-200'>3D Simulation WIP</Label>
            }
            
            { (simulationType.current === "any-d" && isLauched) &&
            <SimulationAnyD 
              key={resetKey}
              gridSize={gridSize}
              initialInfected={initialInfected} 
              infectionChance={infectionChance / 100}
              immunityDuration={immunityDuration} 
              recoveryDuration={recoveryDuration} 
              mortalityChance={mortalityChance / 100} 
              setInfectedCount={setInfectedCount}
              setDeadCount={setDeadCount}
              setFrameCount={setFrameCount}
              resizeFunc={handleResize}
              dimensions={dimensions}
            />
            }

            
          </div>
        </Card>

        {/* Controls Panel */}
        <div className={`flex grow flex-${statsIsRow ? 'row space-x-8' : 'col space-y-8'}`}>
        <Card className="p-6 space-y-6 bg-neutral-800 grow flex flex-col justify-between h-min">
          <div className="space-y-4">
            <Select onValueChange={(value) => {handleSetSimulationType(value)}} defaultValue={simulationType.current}>
              <SelectTrigger className="w-full text-white bg-violet-950">
                <SelectValue placeholder="Select a simulation"/>
              </SelectTrigger>
              <SelectContent className='bg-violet-950'>
                <SelectGroup className="bg-violet-950 text-white">
                  <SelectItem value="2d">2D Simulation</SelectItem>
                  <SelectItem value="3d">3D Simulation</SelectItem>
                  <SelectItem value="any-d">Any-D Simulation</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            { simulationType.current === "any-d" &&
              <div className="space-y-2">
                <div className='flex items-center justify-between'>
                  <Label className="text-neutral-200">
                    Dimensions
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon color="white" width='1rem' height='1rem'/>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Amount of dimensions in the grid</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  
                  <span className="text-sm text-violet-300">{dimensions}</span>
                </div>
                <Slider
                  value={[dimensions]}
                  onValueChange={([value]) => handleSetSettings(setDimensions,value)}
                  min={1}
                  max={Math.floor(totalLimitLog / Math.log(gridSize))}
                  step={1}
                  className="w-full"
                />
              </div>
            }

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">
                  Grid size
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Length of the grid's side</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                
                <span className="text-sm text-violet-300">{gridSize}</span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={([value]) => handleSetSettings(handleSetGridSize,value)}
                min={2}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">
                  Initial infected
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Amount of randomly placed<br/>infected humans</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{initialInfected}</span>
              </div>
              <Slider
                value={[initialInfected]}
                onValueChange={([value]) => handleSetSettings(setInitialInfected,value)}
                min={1}
                max={Math.floor(Math.pow(gridSize, dimensions) * initialInfectedPercentage)+1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200 min-w-[9rem]">
                  Infection chance
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Chance that a human will<br/>infect his neighbors each<br/>unit of time</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{infectionChance}%</span>
              </div>
              <Slider
                value={[infectionChance]}
                onValueChange={([value]) => handleSetSettings(setInfectionChance,value)}
                min={0.2}
                max={100}
                step={0.2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <div className='flex flex-row items-left'>
                  <Label className="text-neutral-200 pr-2 min-w-[7.4rem]">Mortality chance</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Chance that a human will<br/>die after getting infected</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-violet-300 text-right min-w-[2.5rem]">{mortalityChance}%</span>
              </div>
              <Slider
                value={[mortalityChance]}
                onValueChange={([value]) => handleSetSettings(setMortalityChance,value)}
                min={0}
                max={100}
                step={0.2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">
                  Recovery duration
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Amount of units of time<br/>after which human will<br/>become healthy after<br/>getting infected</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{recoveryDuration}</span>
              </div>
              <Slider
                value={[recoveryDuration]}
                onValueChange={([value]) => handleSetSettings(setRecoveryDuration,value)}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">
                  Immunity duration
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Amount of units of time<br/>that human will be immune for<br/>after healing from an infection</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{immunityDuration}</span>
              </div>
              <Slider
                value={[immunityDuration]}
                onValueChange={([value]) => handleSetSettings(setImmunityDuration, value)}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className='flex items-center justify-between'>
              <Checkbox onCheckedChange={(checked: boolean) => {setRestartOnUpdate(checked)}} />
              <Label className="text-neutral-200">
                Restart on change
                <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Restart the simulation after<br/>any change in parameters</p>
                    </TooltipContent>
                  </Tooltip>
              </Label>
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-center items-stretch">
            

            <Button 
              onClick={handleResetSettings}
              className=""
            >
              Reset settings
            </Button>
            <br/>
            <Button 
              onClick={handleReset}
              className=""
              variant="secondary"
            >
              Restart simulation
            </Button>
            
          </div>

        {/* Current stats */}
        </Card>
        { simulationType.current !== "" &&
        <Card className="p-6 bg-neutral-800 grow h-min" ref={statsRef}>
          <div className="space-y-2">
            <Label className="text-neutral-200 text-1xl mb-6">Current stats:</Label>
            
            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Total</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSizeUnchanged, dimensionsUnchanged)}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--infected)]">Infected</Label>
              <span className="text-sm text-violet-300">{infectedCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--healthy)] pr-2">Alive & not infected</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSizeUnchanged, dimensionsUnchanged) - infectedCount - deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--dead)]">Dead</Label>
              <span className="text-sm text-violet-300">{deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Time</Label>
              <span className="text-sm text-violet-300">{frameCount}</span>
            </div>
            <div className='mt-3'>
              <a href='https://github.com/Anvarys/virus-simulation' target='_blank'>
                <div className='mt-3 bg-neutral-700 p-1 rounded-[0.5rem] border-neutral-200 border flex flex-row'>
                  <FontAwesomeIcon icon={faGithub} color='white' size='xl' className='mr-2'/>
                  <Label className='text-neutral-200 text-center'>GitHub</Label>
                </div>
              </a>
            </div>
          </div>
        </Card>
        }
        </div>
      </div>
    </div>
  )
}

export default App