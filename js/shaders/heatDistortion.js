// Heat Distortion Shader – Exhaust heat shimmer effect
export const HeatDistortionShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0.0 },
        uIntensity: { value: 0.0 },
        uCenter: { value: null }, // THREE.Vector2 – screen-space position of exhaust
        uResolution: { value: null } // THREE.Vector2
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uIntensity;
        uniform vec2 uCenter;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        void main() {
            vec2 uv = vUv;
            
            // Distance from exhaust center
            vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
            vec2 diff = (uv - uCenter) * aspect;
            float dist = length(diff);

            // Heat distortion is localized around exhaust, rises upward
            float mask = smoothstep(0.15, 0.0, dist) * uIntensity;
            
            // Rising heat waves
            float wave1 = sin(uv.y * 30.0 - uTime * 3.0 + uv.x * 10.0) * 0.003;
            float wave2 = sin(uv.y * 50.0 - uTime * 5.0 + uv.x * 15.0) * 0.002;
            float n = noise(uv * 20.0 + uTime * 2.0) * 0.004;

            vec2 distortion = vec2(wave1 + n, wave2 + n) * mask;
            
            vec4 color = texture2D(tDiffuse, uv + distortion);
            gl_FragColor = color;
        }
    `
};
