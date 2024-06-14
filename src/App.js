import './App.css'
import Box from './components/Box'
import { OrbitControls, Stats, TrackballControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Planets from './components/Planets'
import Sun from './components/Sun'
import { Suspense } from 'react'

function Loading() {
  return null
}

function App() {

  return (
    <>
    <Canvas 
      camera={ {
        fov: 45,
        near: 0.1,
        far: 20000,
        position: [ -3, 1.5, 4 ]
      } }>
      <Suspense fallback={<Loading />}>
        <ambientLight intensity="1"/>
        <pointLight position={[0, 0, 0]} />
        <TrackballControls />
        <Planets />
        <Sun />
        <Stats />
      </Suspense>
    </Canvas>
    </>
  );
}

export default App;
