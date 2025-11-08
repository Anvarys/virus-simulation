import './App.css'
import React from 'react'
import Simulation2D from './simulations/2d';
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function App() {
  const [resetKey, setResetKey] = React.useState(0);
  const [gridSize, setGridSize] = React.useState(20);
  const [initialInfected, setInitialInfected] = React.useState(1);
  const [infectionChance, setInfectionChance] = React.useState(20);
  const [mortalityChance, setMortalityChance] = React.useState(2);
  const [recoveryDuration, setRecoveryDuration] = React.useState(10);
  const [immunityDuration, setImmunityDuration] = React.useState(4);
  const [dimensions, setDimensions] = React.useState(2);

  const [simulationType, setSimulationType] = React.useState("");

  const initialInfectedPercentage = 0.1;

  const defaultSettings = {
    gridSize: 20,
    initialInfected: 4,
    infectionChance: 20,
    mortalityChance: 2,
    recoveryDuration: 10,
    immunityDuration: 4,
    dimensions: 2,
  };

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
    const limit = Math.floor(Math.pow(size, dimensions) * initialInfectedPercentage);
    if (initialInfected > limit)
    {
      setInitialInfected(limit);
    }
  }

  return (
    <div className='min-h-[100dvh] flex items-center justify-center p-8 bg-neutral-900'>
      <div className='flex gap-8 w-full max-w-7xl'>
        {/* Simulation Area */}
        <Card className="flex-1 aspect-square bg-neutral-800">
          <div className="w-full h-full flex items-center justify-center">
            { simulationType === "2d" &&
            <Simulation2D 
              key={resetKey}
              gridSize={gridSize} 
              initialInfected={initialInfected} 
              infectionChance={infectionChance / 100} 
              immunityDuration={immunityDuration} 
              recoveryDuration={recoveryDuration} 
              mortalityChance={mortalityChance / 100} 
            />
            }
            { simulationType === "3d" &&
            <Label className='text-neutral-200'>3D Simulation WIP</Label>
            }
            { simulationType === "any-d" &&
            <Label className='text-neutral-200'>Any-D Simulation WIP</Label>
            }
          </div>
        </Card>

        {/* Controls Panel */}
        <Card className="w-80 p-6 space-y-6 bg-neutral-800">
          <div className="space-y-4">
            <Select onValueChange={(value) => {setSimulationType(value)}}>
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
      </div>
    </div>
  )
}

export default App