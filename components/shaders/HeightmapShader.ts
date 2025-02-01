export const HeightmapFragment = `
#define PI 3.1415926538
#define GEOM_WIDTH 512.0
#define GEOM_HEIGHT 512.0

uniform vec2 mousePos;
uniform float mouseSize;
uniform float viscosityConstant;
uniform float waveheightMultiplier;

void main() {
    vec2 cellSize = 1.0 / resolution.xy;
    vec2 uv = gl_FragCoord.xy * cellSize;

    // heightmapValue.x == height from previous frame
    // heightmapValue.y == height from penultimate frame
    vec4 heightmapValue = texture2D(heightmap, uv);

    // Get neighbours for wave propagation
    vec4 north = texture2D(heightmap, uv + vec2(0.0, cellSize.y));
    vec4 south = texture2D(heightmap, uv + vec2(0.0, -cellSize.y));
    vec4 east = texture2D(heightmap, uv + vec2(cellSize.x, 0.0));
    vec4 west = texture2D(heightmap, uv + vec2(-cellSize.x, 0.0));

    // Calculate new height based on neighbors
    float newHeight = ((north.x + south.x + east.x + west.x) * 0.5 - heightmapValue.y) * viscosityConstant;

    // Mouse influence
    float mousePhase = clamp(length((uv - vec2(0.5)) * vec2(GEOM_WIDTH, GEOM_HEIGHT) - vec2(mousePos.x, -mousePos.y)) * PI / mouseSize, 0.0, PI);
    newHeight += (cos(mousePhase) + 1.0) * waveheightMultiplier;

    heightmapValue.y = heightmapValue.x;
    heightmapValue.x = newHeight;

    gl_FragColor = heightmapValue;
}
` 