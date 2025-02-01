'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { Sky } from '@react-three/drei'
import { Water } from './Water'
import { useThree } from '@react-three/fiber'

function Scene() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(-50, 30, 100)
    camera.lookAt(0, 100, -1000)
  }, [camera])

  return (
    <Suspense fallback={null}>
      <Water />
      <Sky 
        distance={450000} 
        sunPosition={[0, 125, -1000]}
        inclination={0.6}
        azimuth={0.1}
        mieCoefficient={0.005}
        elevation={2}
        mieDirectionalG={0.7}
        rayleigh={6}
        turbidity={10}
        exposure={0.5}
      />
      <ambientLight intensity={0.3} />
      {/* Main sunset light */}
      <directionalLight 
        position={[500, 150, -1000]}
        intensity={5.0} 
        color="#ffa726"
      />
      {/* Secondary sunset light */}
      <directionalLight
        position={[-500, 100, -1000]}
        intensity={3.0}
        color="#ff7043"
      />
      {/* Fill light from above */}
      <directionalLight
        position={[0, 500, 0]}
        intensity={0.5}
        color="#fff"
      />
      {/* Rim light from behind */}
      <directionalLight
        position={[0, 50, 1000]}
        intensity={1.0}
        color="#ffd54f"
      />
      <fog attach="fog" args={['#16161d', 0, 1000]} />
    </Suspense>
  )
}

export function Scene3DWrapper() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ 
          fov: 60,
          near: 1,
          far: 20000,
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
} 