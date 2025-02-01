'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function Water() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const mousePos = useRef(new THREE.Vector2(10000, 10000))
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    size: { value: 4.0 },
    distortionScale: { value: 20.0 },
    normalSampler: { 
      value: new THREE.TextureLoader().load('/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      })
    },
    sunColor: { value: new THREE.Color('#ffa726').multiplyScalar(3.0) },
    sunDirection: { value: new THREE.Vector3(0.70707, 0.70707, 0).normalize() },
    waterColor: { value: new THREE.Color('#0288d1').multiplyScalar(2.0) },
    glowColor: { value: new THREE.Color('#4fc3f7').multiplyScalar(2.0) },
    eye: { value: new THREE.Vector3() },
    mousePos: { value: mousePos.current },
    mouseSize: { value: 15.0 }
  }), [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates
      mousePos.current.x = (event.clientX / size.width) * 2 - 1
      mousePos.current.y = -(event.clientY / size.height) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [size])

  useFrame((state) => {
    if (!meshRef.current) return
    uniforms.time.value = state.clock.getElapsedTime() * 0.5
    uniforms.eye.value.copy(camera.position)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5, 0]}
    >
      <planeGeometry args={[10000, 10000, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vViewPosition;

          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float size;
          uniform vec3 waterColor;
          uniform vec3 sunColor;
          uniform vec3 glowColor;
          uniform vec3 sunDirection;
          uniform vec3 eye;
          uniform sampler2D normalSampler;
          uniform vec2 mousePos;
          uniform float mouseSize;
          
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          varying vec3 vViewPosition;

          void main() {
            // Animated normal map with two layers
            vec2 uv = vUv * size;
            vec2 flowUv1 = uv + time * 0.03;
            vec2 flowUv2 = uv * 1.5 - time * 0.04;
            vec4 normalMap1 = texture2D(normalSampler, flowUv1);
            vec4 normalMap2 = texture2D(normalSampler, flowUv2);
            
            // Combine normal maps
            vec3 normal = normalize(vNormal + 
              (normalMap1.rgb * 2.0 - 1.0) * 0.7 +
              (normalMap2.rgb * 2.0 - 1.0) * 0.3
            );
            
            // View and reflection vectors
            vec3 viewVector = normalize(vViewPosition);
            vec3 sunReflection = reflect(-sunDirection, normal);
            
            // Enhanced Fresnel effect
            float fresnel = pow(1.0 - max(dot(normal, viewVector), 0.0), 3.0);
            
            // Sun specular with wider spread
            float specular = pow(max(dot(sunReflection, viewVector), 0.0), 60.0);
            
            // Glow effect based on view angle
            float glow = pow(max(dot(viewVector, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);
            
            // Wave height glow
            float waveGlow = (normalMap1.r + normalMap2.r) * 0.5;
            
            // Add mouse ripple
            float mouseDistance = length((vUv - 0.5) * 2.0 - mousePos);
            float mouseRipple = sin(mouseDistance * 20.0 - time * 5.0) * exp(-mouseDistance * mouseSize);
            normal = normalize(normal + vec3(mouseRipple * 0.2, 0.0, mouseRipple * 0.2));
            
            // Combine colors
            vec3 water = waterColor;
            water += sunColor * specular * 3.0;
            water += glowColor * waveGlow * 0.5;
            water = mix(water, glowColor, fresnel * 0.7);
            water += glowColor * glow * 0.3;
            
            gl_FragColor = vec4(water, 0.9);
          }
        `}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
} 