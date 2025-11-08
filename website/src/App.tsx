import './App.css'
import React from 'react'
import Simulation2D from './simulations/2d';
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const simulationType = React.useRef(localStorage.getItem('simulationType') || "");

  const initialInfectedPercentage = 0.1;

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
    const limit = Math.floor(Math.pow(gridSize, dimensions) * initialInfectedPercentage);
    if (initialInfected > limit)
    {
      setInitialInfected(limit);
    }
  }

  const handleSetSimulationType = (type: string) => {
    simulationType.current = type;
    localStorage.setItem('simulationType', type);
    handleReset();
  }
  
  const handleLaunch = () => {
    setIsLaunched(true);
  }

  return (
    <div className='min-h-[100dvh] flex items-center justify-center p-8 bg-neutral-900'>
      <div className='flex gap-8 w-full max-w-7xl'>
        {/* Simulation Area */}
        <Card className="flex-1 aspect-square bg-neutral-800 p-0 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
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
            />
            }

            { (simulationType.current === "3d" && isLauched) &&
            <Label className='text-neutral-200'>3D Simulation WIP</Label>
            }
            
            { (simulationType.current === "any-d" && isLauched) &&
            <Label className='text-neutral-200'>Any-D Simulation WIP</Label>
            }

            
          </div>
        </Card>

        {/* Controls Panel */}
        <div className='space-y-8'>
        <Card className="w-80 p-6 space-y-6 bg-neutral-800">
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

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Grid size</Label>
                
                <span className="text-sm text-violet-300">{gridSize}</span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={([value]) => handleSetGridSize(value)}
                min={10}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Initial infected</Label>
                <span className="text-sm text-violet-300">{initialInfected}</span>
              </div>
              <Slider
                value={[initialInfected]}
                onValueChange={([value]) => setInitialInfected(value)}
                min={1}
                max={Math.floor(Math.pow(gridSize, dimensions) * initialInfectedPercentage)}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Infection chance</Label>
                <span className="text-sm text-violet-300">{infectionChance}%</span>
              </div>
              <Slider
                value={[infectionChance]}
                onValueChange={([value]) => setInfectionChance(value)}
                min={0.2}
                max={100}
                step={0.2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Mortality chance</Label>
                <span className="text-sm text-violet-300">{mortalityChance}%</span>
              </div>
              <Slider
                value={[mortalityChance]}
                onValueChange={([value]) => setMortalityChance(value)}
                min={0}
                max={100}
                step={0.2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Recovery duration</Label>
                <span className="text-sm text-violet-300">{recoveryDuration}</span>
              </div>
              <Slider
                value={[recoveryDuration]}
                onValueChange={([value]) => setRecoveryDuration(value)}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="text-neutral-200">Immunity duration</Label>
                <span className="text-sm text-violet-300">{immunityDuration}</span>
              </div>
              <Slider
                value={[immunityDuration]}
                onValueChange={([value]) => setImmunityDuration(value)}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleResetSettings}
              className="w-full"
              
            >
              Reset settings
            </Button>
            
            <Button 
              onClick={handleReset}
              className="w-full"
              variant="secondary"
            >
              Restart simulation
            </Button>
            
          </div>
        </Card>
        { simulationType.current !== "" &&
        <Card className="w-80 p-6 bg-neutral-800">
          <div className="space-y-2">
            <Label className="text-neutral-200 text-1xl mb-6">Current stats:</Label>
            
            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Total</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSize, dimensions)}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Infected</Label>
              <span className="text-sm text-violet-300">{infectedCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Alive & not infected</Label>
              <span className="text-sm text-violet-300">{Math.pow(gridSize, dimensions) - infectedCount - deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Dead</Label>
              <span className="text-sm text-violet-300">{deadCount}</span>
            </div>

            <div className='flex items-center justify-between'>
              <Label className="text-neutral-200">Time</Label>
              <span className="text-sm text-violet-300">{frameCount}</span>
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