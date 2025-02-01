import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec4 vWorldPosition;

uniform float time;

#define WAVE_COUNT 4

// Gerstner wave parameters
struct Wave {
    vec2 direction;
    float steepness;
    float wavelength;
    float speed;
};

uniform Wave waves[WAVE_COUNT];

// Gerstner wave function
vec3 gerstnerWave(vec3 position, Wave wave, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * PI / wave.wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(wave.direction);
    float f = k * (dot(d, position.xz) - c * time);
    float a = wave.steepness / k;
    
    tangent += vec3(
        -d.x * d.x * wave.steepness * sin(f),
        d.x * wave.steepness * cos(f),
        -d.x * d.y * wave.steepness * sin(f)
    );
    
    binormal += vec3(
        -d.x * d.y * wave.steepness * sin(f),
        d.y * wave.steepness * cos(f),
        -d.y * d.y * wave.steepness * sin(f)
    );
    
    return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
    );
}

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calculate waves
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 totalWave = vec3(0.0);
    
    for(int i = 0; i < WAVE_COUNT; i++) {
        totalWave += gerstnerWave(pos, waves[i], tangent, binormal);
    }
    
    pos += totalWave;
    
    // Calculate normal
    vec3 normal = normalize(cross(binormal, tangent));
    vNormal = normalMatrix * normal;
    
    vPosition = pos;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = modelMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
uniform vec3 sunColor;
uniform vec3 waterColor;
uniform vec3 sunDirection;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec4 vWorldPosition;

// Constants for realistic water
const float shininess = 200.0;
const float reflectivity = 1.0;
const float waterOpacity = 0.8;
const vec3 deepColor = vec3(0.0, 0.1, 0.2);
const vec3 foamColor = vec3(1.0, 1.0, 1.0);

// Foam noise
float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec3 worldNormal = normalize(vNormal);
    vec3 viewVector = normalize(vViewPosition);
    
    // Enhanced Fresnel effect
    float fresnelBias = 0.1;
    float fresnelScale = 1.0;
    float fresnelPower = 2.0;
    float fresnelTerm = fresnelBias + fresnelScale * pow(1.0 - dot(worldNormal, viewVector), fresnelPower);
    
    // Dynamic sun reflection
    vec3 sunReflection = reflect(-sunDirection, worldNormal);
    float sunSpecular = pow(max(dot(sunReflection, viewVector), 0.0), shininess);
    
    // Wave height-based foam
    float waveHeight = vPosition.y;
    float foam = smoothstep(0.7, 1.0, waveHeight) * 0.5;
    foam += noise(vUv * 10.0 + time * 0.5) * 0.1;
    
    // Water depth effect
    float depth = smoothstep(-5.0, 0.0, vWorldPosition.y);
    vec3 baseColor = mix(deepColor, waterColor, depth);
    
    // Combine all effects
    vec3 reflectionColor = mix(baseColor, sunColor, sunSpecular * reflectivity);
    vec3 finalColor = mix(baseColor, reflectionColor, fresnelTerm);
    
    // Add foam
    finalColor = mix(finalColor, foamColor, foam);
    
    // Add subtle wave highlights
    float highlight = smoothstep(0.3, 1.0, waveHeight) * 0.3;
    finalColor += sunColor * highlight;

    gl_FragColor = vec4(finalColor, mix(waterOpacity, 1.0, fresnelTerm + foam));
}
`

export class WaterMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        sunColor: { value: new THREE.Color('#ff7e47') },
        waterColor: { value: new THREE.Color('#006994') },
        sunDirection: { value: new THREE.Vector3(0.5, 0.5, -0.5) },
        time: { value: 0 },
        waves: { value: [
          {
            direction: new THREE.Vector2(1, 0),
            steepness: 0.3,
            wavelength: 60,
            speed: 1.0
          },
          {
            direction: new THREE.Vector2(0.7, 0.7),
            steepness: 0.2,
            wavelength: 30,
            speed: 0.8
          },
          {
            direction: new THREE.Vector2(0, 1),
            steepness: 0.15,
            wavelength: 20,
            speed: 1.2
          },
          {
            direction: new THREE.Vector2(-0.7, 0.7),
            steepness: 0.1,
            wavelength: 15,
            speed: 1.3
          }
        ]}
      },
      transparent: true,
      side: THREE.DoubleSide
    })
  }
} 