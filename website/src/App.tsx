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
import Simulation3D from '@/simulations/3d';
import type { Virus } from './utlis';
import VirusEditor from './viruses/virus-editor';

function App() {
  const defaultSettings = {
    gridSize: 15,
    initialInfected: 4,
    infectionChance: 20,
    mortalityChance: 0.2,
    recoveryDuration: 10,
    immunityDuration: 4,
    dimensions: 2,
    opacity: 50,
    cubeSize: 90
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
  const [opacity, setOpacity] = React.useState(() => {
    return Number(localStorage.getItem('opacity')) || defaultSettings.opacity;
  });
  const [cubeSize, setCubeSize] = React.useState(() => {
    return Number(localStorage.getItem('cubeSize')) || defaultSettings.cubeSize;
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

  const [isVirusEditorOpen, setIsVirusEditorOpen] = React.useState(false)

  const infoRef = React.useRef<HTMLDivElement | null>(null);
  const [statsIsRow, setStatsIsRow] = React.useState(false);

  const [simulationType, setSimulationType] = React.useState(localStorage.getItem('simulationType') || "");

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
    localStorage.setItem('opacity', String(opacity));
    localStorage.setItem('cubeSize', String(cubeSize));
  }, [gridSize, initialInfected, infectionChance, mortalityChance, recoveryDuration, immunityDuration, dimensions, opacity, cubeSize]);

  const [deadCount, setDeadCount] = React.useState(0);
  const [infectedCount, setInfectedCount] = React.useState(0);
  const [frameCount, setFrameCount] = React.useState(0);

  const virusesRef = React.useRef<Virus[]>([])

  const [isLauched, setIsLaunched] = React.useState(true);

  const [virusEditorKey, setVirusEditorKey] = React.useState(0);

  React.useEffect(() => {
    if (simulationType !== "") {
      setIsLaunched(false);
    }
  }, []);

  const handleReset = () => {
    setGridSizeUnchanged(gridSize);
    setDimensionsUnchanged(dimensions);

    if (!virusesRef.current){
    virusesRef.current = [{
      infectionChance: infectionChance / 100,
      recoveryDuration: recoveryDuration,
      mortalityChance: mortalityChance / 100,
      immunityDuration: immunityDuration,
      color: getComputedStyle(document.documentElement).getPropertyValue("--infected").trim(),
      name: "VIRUS52"
    } satisfies Virus]
    }

    setResetKey(prev => prev + 1);
  };

  const handleResetSettings = () => {
    setGridSize(defaultSettings.gridSize);
    setInitialInfected(defaultSettings.initialInfected);
    setInfectionChance(defaultSettings.infectionChance);
    setMortalityChance(defaultSettings.mortalityChance);
    setRecoveryDuration(defaultSettings.recoveryDuration);
    setImmunityDuration(defaultSettings.immunityDuration);
  };

  const handleSetGridSize = (size: number) => {
    setGridSize(size);
    const initialInfectedlimit = Math.floor(Math.pow(size, dimensions) * initialInfectedPercentage)+1;
    if (initialInfected > initialInfectedlimit)
    {
      setInitialInfected(initialInfectedlimit);
    }

    const dimensionsLimit = Math.floor(totalLimitLog / Math.log(size));
    if (dimensions > dimensionsLimit) {
      handleSetDimensions(dimensionsLimit);
    }
  }

  const handleSetDimensions = (dims: number) => {
    setDimensions(dims)
    const initialInfectedlimit = Math.floor(Math.pow(gridSize, dims) * initialInfectedPercentage)+1;
    if (initialInfected > initialInfectedlimit)
    {
      setInitialInfected(initialInfectedlimit);
    }
  }

  const handleSetSimulationType = (type: string) => {
    setSimulationType(type);
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
    handleReset();
    setIsLaunched(true);
  }

  const resetVirusEditor = () => {
    setVirusEditorKey(virusEditorKey+1)
  }



  const handleResize = () => {
    const infoElement = infoRef.current;
    if (infoElement) {
      const rect = infoElement.getBoundingClientRect();
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

  React.useEffect(() => {
    resetVirusEditor();
  }, [virusesRef])

  React.useEffect(() => {
    if (simulationType == "2d")
    handleSetDimensions(2);

    if (simulationType == "3d")
    handleSetDimensions(3);
  }, [simulationType])

  return (
    <div className='min-h-[100dvh] min-w-full flex items-center p-[2dvh] bg-neutral-950'>
      <div className='flex gap-8 w-full max-w-[96dvw] h-[96dvh] text-neutral-100'>
        {/* Simulation Area */}
        <Card className="flex-1 aspect-square bg-neutral-900 p-0 overflow-hidden max-h-full min-w-[96dvh] max-w-[96dvh] border-neutral-800">
          <div className="w-full h-full flex items-center justify-center aspect-square">
            { !isLauched &&
              <Button 
                onClick={handleLaunch}
              >
                Launch Simulation
              </Button>
            }
            { simulationType === "" && isLauched &&
              <div className='p-10 flex flex-col space-y-2'>
                <h1 className='text-2xl text-center'>
                This site visualises and shows different simulations of virus spreading.
                </h1>
                <p className='text-center mr-[20%] ml-[20%] text-neutral-200'>
                  Main idea is that there are humans in a grid where each human has an <span className='text-violet-300'>infection chance</span> - chance of getting infected each unit of time by it's infected neighbors. When a human is infected they will stay infected for the <span className='text-violet-300'>recovery duration</span> and then they will have an <span className='text-violet-300'>immunity duration</span> of time when they are immune to the virus. And also there is <span className='text-violet-300'>mortality chance</span> - chance of an infected human dying (per unit of time)</p>
                <h3 className='mt-10 text-center text-neutral-400 text-x'>Start by choosing a simulation on the right<br/>I suggest starting from 2D</h3>
              </div>
            }
            { (simulationType === "2d" && isLauched)  &&
            <Simulation2D 
              key={resetKey}
              gridSize={gridSize}
              initialInfected={initialInfected} 
              viruses={virusesRef.current}
              setInfectedCount={setInfectedCount}
              setDeadCount={setDeadCount}
              setFrameCount={setFrameCount}
              resizeFunc={handleResize}
            />
            }

            { (simulationType === "3d" && isLauched) &&
            <Simulation3D 
              key={resetKey}
              gridSize={gridSize}
              initialInfected={initialInfected} 
              viruses={virusesRef.current}
              setInfectedCount={setInfectedCount}
              setDeadCount={setDeadCount}
              setFrameCount={setFrameCount}
              resizeFunc={handleResize}
              opacity={opacity / 100}
              cubeSize={cubeSize / 100}
            />
            }
            
            { (simulationType === "any-d" && isLauched) &&
            <SimulationAnyD 
              key={resetKey}
              gridSize={gridSize}
              initialInfected={initialInfected} 
              viruses={virusesRef.current}
              setInfectedCount={setInfectedCount}
              setDeadCount={setDeadCount}
              setFrameCount={setFrameCount}
              resizeFunc={handleResize}
              dimensions={dimensions}
            />
            }

            
          </div>
        </Card>

        {/* Side Panel */}
        <div className={`flex grow flex-${statsIsRow ? 'row space-x-8' : 'col space-y-8'}`}>

        {/* Control Panel */}
        <Card className="p-6 space-y-6 bg-neutral-900 grow flex flex-col justify-between h-min border-neutral-800">
          <div className="space-y-4">
            <Select onValueChange={(value) => {handleSetSimulationType(value)}} value={simulationType}>
              <SelectTrigger className="w-full bg-violet-950 border-violet-900">
                <SelectValue placeholder="Select a simulation"/>
              </SelectTrigger>
              <SelectContent className='bg-violet-950 border-violet-900'>
                <SelectGroup className="bg-violet-950 border-violet-900 text-neutral-100">
                  <SelectItem value="2d">2D Simulation</SelectItem>
                  <SelectItem value="3d">3D Simulation</SelectItem>
                  <SelectItem value="any-d">Any-D Simulation</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            { simulationType === "any-d" &&
              <div className="space-y-2">
                <div className='flex items-center justify-between'>
                  <Label>
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
                  onValueChange={([value]) => handleSetSettings(handleSetDimensions,value)}
                  min={1}
                  max={Math.floor(totalLimitLog / Math.log(gridSize))}
                  step={1}
                  className="w-full"
                />
              </div>
            }

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
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
                <Label>
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
                <Label className="min-w-[9rem]">
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
                  <Label className="pr-2 min-w-[7.4rem]">Mortality chance</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Chance that a human will<br/>die each unit of time<br/>when he is infected</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-violet-300 text-right min-w-[3rem]">{mortalityChance}%</span>
              </div>
              <Slider
                value={[mortalityChance]}
                onValueChange={([value]) => handleSetSettings(setMortalityChance,value)}
                min={0}
                max={10}
                step={0.02}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
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
                <Label>
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
            { simulationType === "3d" &&
            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
                  Opacity
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Opacity of the cubes<br/>in the visulaisation</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([value]) => setOpacity(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            }
            { simulationType === "3d" &&
            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
                  Cube size
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Relative size of the cubes<br/>in the visulaisation</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{cubeSize}%</span>
              </div>
              <Slider
                value={[cubeSize]}
                onValueChange={([value]) => setCubeSize(value)}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            }
            <div className='flex items-center justify-between'>
              <Checkbox onCheckedChange={(checked: boolean) => {setRestartOnUpdate(checked)}} />
              <Label>
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
              className="bg-violet-800 border-violet-700 border hover:bg-violet-700 border-violet-600"
            >
              Reset settings
            </Button>
            <br/>
            { simulationType !== "" &&
            <Button 
              onClick={handleReset}
              className="bg-cyan-800 border-cyan-700 border hover:bg-cyan-700 hover:border-cyan-600"
            >
              Restart simulation
            </Button>
            }
            { false && // WIP
            <Button 
              onClick={() => {setIsVirusEditorOpen(true)}}
              className="bg-orange-800 border-orange-700 border hover:bg-orange-700 hover:border-orange-600"
            >
              Open editor
            </Button>
            }
          </div>

        {/* Info Panel */}
        </Card>
        { simulationType !== "" &&
        <Card className="p-6 bg-neutral-900 grow h-min border-neutral-800" ref={infoRef}>
          <div className="space-y-2">
            <div className='flex items-center justify-between'>
              <Label>Total</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSizeUnchanged, dimensionsUnchanged)}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--infected)] pr-2">Total infected</Label>
              <span className="text-sm text-violet-300">{infectedCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--healthy)] pr-2">Healthy</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSizeUnchanged, dimensionsUnchanged) - infectedCount - deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-[var(--dead)]">Dead</Label>
              <span className="text-sm text-violet-300">{deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label>Time</Label>
              <span className="text-sm text-violet-300">{frameCount}</span>
            </div>
            <div className='mt-3'>
              <a href='https://github.com/Anvarys/virus-simulation' target='_blank'>
                <div className='mt-3 bg-neutral-800 p-1 rounded-[0.5rem] border-neutral-700 border flex flex-row'>
                  <FontAwesomeIcon icon={faGithub} color='var(--color-neutral-100)' size='xl' className='mr-2'/>
                  <Label className='text-center cursor-pointer'>GitHub</Label>
                </div>
              </a>
            </div>
            <div className='grow'>
              <p className='text-xs text-neutral-400 text-center hover:underline cursor-pointer' onClick={() => {handleSetSimulationType("")}}>About this project</p>
            </div>
          </div>
        </Card>
        }
        </div>
      </div>
      <VirusEditor 
          key={virusEditorKey}
          virusesRef={virusesRef}
          isOpen={isVirusEditorOpen}
          setIsOpen={setIsVirusEditorOpen}
        />
    </div>
  )
}

export default App