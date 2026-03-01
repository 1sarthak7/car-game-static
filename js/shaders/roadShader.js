// Road Shader – Animated reflective wet-look streaks
export const RoadShader = {
    uniforms: {
        uTime: { value: 0.0 },
        uCameraPosition: { value: null } // THREE.Vector3
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`
        uniform float uTime;
        uniform vec3 uCameraPosition;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

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

        void main() {
            // Base asphalt color with subtle variation
            vec2 scaledUV = vUv * 50.0;
            float asphaltNoise = noise(scaledUV * 8.0) * 0.1;
            vec3 asphalt = vec3(0.08, 0.08, 0.09) + asphaltNoise;

            // Lane markings
            float laneCenter = abs(fract(vUv.x * 4.0) - 0.5);
            float laneMark = smoothstep(0.48, 0.49, laneCenter);
            float dashPattern = step(0.5, fract(vUv.y * 8.0));
            vec3 laneColor = vec3(0.9, 0.85, 0.3) * laneMark * dashPattern;

            // Road edge lines (solid)
            float edgeL = smoothstep(0.01, 0.02, vUv.x);
            float edgeR = smoothstep(0.99, 0.98, vUv.x);
            float edge = (1.0 - edgeL) + (1.0 - edgeR);
            vec3 edgeColor = vec3(0.9, 0.9, 0.9) * edge;

            // Wet reflective streaks
            float streak1 = noise(vec2(vUv.x * 20.0, vUv.y * 2.0 + uTime * 0.3));
            float streak2 = noise(vec2(vUv.x * 30.0 + 5.0, vUv.y * 3.0 + uTime * 0.2));
            float streaks = smoothstep(0.55, 0.8, streak1 * streak2) * 0.4;

            // View-dependent reflection
            vec3 viewDir = normalize(uCameraPosition - vWorldPos);
            float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
            vec3 reflectionColor = vec3(0.3, 0.35, 0.5) * fresnel * 0.5;

            // Scrolling light reflections on wet surface
            float lightRef = sin(vUv.y * 40.0 + uTime * 2.0) * 0.5 + 0.5;
            lightRef *= sin(vUv.x * 10.0 + uTime * 0.5) * 0.5 + 0.5;
            lightRef = pow(lightRef, 4.0) * 0.15;
            vec3 scrollLight = vec3(0.8, 0.6, 0.3) * lightRef * fresnel;

            vec3 finalColor = asphalt + laneColor + edgeColor + reflectionColor + streaks * vec3(0.2, 0.25, 0.35) + scrollLight;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};
