import './App.css'
import React from 'react'
import Simulation2D from './simulations/2d';

function App() {
  return (
    <div className='relative min-h-[100dvh] flex flex-col items-center justify-center bg-neutral-900 text-white text-5xl'>
      <Simulation2D gridSize={20} initialInfected={1} infectionChance={0.2} immunityDuration={4} recoveryDuration={10} mortalityChance={0.02}></Simulation2D>
    </div>
  )
}

export default App