// Sky Shader – Animated gradient dome with twinkling stars
export const SkyShader = {
    uniforms: {
        uTime: { value: 0.0 },
        uSunPosition: { value: null } // THREE.Vector3
    },
    vertexShader: /* glsl */`
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`
        uniform float uTime;
        uniform vec3 uSunPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;

        // Hash function for procedural noise
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        // Smooth noise
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        // Stars layer
        float stars(vec2 uv, float density, float brightness) {
            vec2 cell = floor(uv * density);
            vec2 cellUv = fract(uv * density);
            float starHash = hash(cell);
            
            if (starHash > 0.97) {
                vec2 starPos = vec2(hash(cell + 0.1), hash(cell + 0.2));
                float dist = length(cellUv - starPos);
                float twinkle = sin(uTime * (2.0 + starHash * 4.0) + starHash * 6.28) * 0.5 + 0.5;
                float star = smoothstep(0.05, 0.0, dist) * brightness * (0.5 + 0.5 * twinkle);
                return star;
            }
            return 0.0;
        }

        void main() {
            vec3 dir = normalize(vWorldPosition);
            float height = dir.y * 0.5 + 0.5; // 0 at horizon, 1 at zenith

            // Animated sunset/twilight gradient
            float timeShift = sin(uTime * 0.05) * 0.15;
            
            // Deep space at top
            vec3 zenith = vec3(0.05, 0.02, 0.15);
            // Mid sky purple
            vec3 midSky = vec3(0.12, 0.05, 0.25);
            // Horizon warm glow
            vec3 horizonWarm = vec3(0.6, 0.2, 0.15);
            // Sun area glow
            vec3 sunGlow = vec3(1.0, 0.5, 0.2);

            vec3 skyColor = mix(horizonWarm, midSky, smoothstep(0.0, 0.35, height));
            skyColor = mix(skyColor, zenith, smoothstep(0.35, 0.8, height));

            // Sun glow effect
            float sunDot = max(dot(dir, normalize(uSunPosition)), 0.0);
            float sunDisc = smoothstep(0.995, 0.999, sunDot);
            float sunHalo = pow(sunDot, 8.0) * 0.6;
            float sunAtmo = pow(sunDot, 3.0) * 0.3;
            skyColor += sunGlow * (sunDisc + sunHalo + sunAtmo);

            // Stars – only visible above horizon  
            float starMask = smoothstep(0.2, 0.5, height);
            vec2 starUV = vec2(atan(dir.x, dir.z), dir.y);
            float s1 = stars(starUV, 80.0, 1.0);
            float s2 = stars(starUV + 100.0, 120.0, 0.7);
            float s3 = stars(starUV + 200.0, 200.0, 0.4);
            skyColor += vec3(s1 + s2 + s3) * starMask;

            // Moving clouds
            vec2 cloudUV = dir.xz / (dir.y + 0.1) * 0.5;
            float cloud = noise(cloudUV * 3.0 + uTime * 0.02);
            cloud *= noise(cloudUV * 6.0 - uTime * 0.01);
            cloud = smoothstep(0.15, 0.5, cloud) * smoothstep(0.0, 0.3, height) * 0.35;
            skyColor = mix(skyColor, vec3(0.35, 0.25, 0.4), cloud);

            gl_FragColor = vec4(skyColor, 1.0);
        }
    `
};
