'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function TyndallEffect() {
  const particlesCount = 2000
  const positions = new Float32Array(particlesCount * 3)
  const particlesGeometry = new THREE.BufferGeometry()
  const ref = useRef<THREE.Points>(null)

  // Create particles in a volume
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = (Math.random() - 0.5) * 10
    positions[i3 + 2] = (Math.random() - 0.5) * 4
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry {...particlesGeometry} />
      <pointsMaterial
        size={0.05}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
} 