import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// Custom vignette shader
const VignetteShader = {
    uniforms: {
        tDiffuse: { value: null },
        uIntensity: { value: 0.4 },
        uSmoothness: { value: 0.8 }
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
        uniform float uIntensity;
        uniform float uSmoothness;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 center = vUv - 0.5;
            float dist = length(center);
            float vignette = smoothstep(uSmoothness, uSmoothness - 0.4, dist);
            color.rgb *= mix(1.0, vignette, uIntensity);
            gl_FragColor = color;
        }
    `
};

export class PostProcessingPipeline {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        const size = renderer.getSize(new THREE.Vector2());

        // Composer
        this.composer = new EffectComposer(renderer);

        // Render pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // Bloom
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.x, size.y),
            0.8,   // strength
            0.4,   // radius
            0.6    // threshold
        );
        this.composer.addPass(this.bloomPass);

        // FXAA
        this.fxaaPass = new ShaderPass(FXAAShader);
        this.fxaaPass.uniforms['resolution'].value.set(1 / size.x, 1 / size.y);
        this.composer.addPass(this.fxaaPass);

        // Vignette
        this.vignettePass = new ShaderPass(VignetteShader);
        this.composer.addPass(this.vignettePass);

        this.baseBloomStrength = 0.8;
        this.maxBloomStrength = 2.0;
    }

    resize(width, height) {
        this.composer.setSize(width, height);
        this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
    }

    update(speedNormalized) {
        // Speed-based bloom increase
        const bloomStrength = this.baseBloomStrength + speedNormalized * (this.maxBloomStrength - this.baseBloomStrength);
        this.bloomPass.strength = THREE.MathUtils.lerp(this.bloomPass.strength, bloomStrength, 0.05);

        // Speed-based vignette increase
        const vignetteIntensity = 0.3 + speedNormalized * 0.5;
        this.vignettePass.uniforms.uIntensity.value = THREE.MathUtils.lerp(
            this.vignettePass.uniforms.uIntensity.value,
            vignetteIntensity,
            0.05
        );
    }

    render() {
        this.composer.render();
    }
}
