import * as THREE from 'three';
import { World } from './world.js';
import { Car } from './car.js';
import { CinematicCamera } from './camera.js';
import { PostProcessingPipeline } from './postprocessing/pipeline.js';

// ============================================================
// VELOCITY REALM – Cinematic Web Driving World
// ============================================================

class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.audioStarted = false;

        this._initRenderer();
        this._initScene();
        this._initModules();
        this._initInput();
        this._initAudio();
        this._initHUD();
        this._initEvents();

        // Show start overlay
        document.getElementById('start-overlay').addEventListener('click', () => {
            this._start();
        });
    }

    _initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: false, // FXAA handles this
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    _initScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            600
        );
    }

    _initModules() {
        this.world = new World(this.scene);
        this.car = new Car(this.scene);
        this.cinematicCamera = new CinematicCamera(this.camera);
        this.postProcessing = new PostProcessingPipeline(this.renderer, this.scene, this.camera);
    }

    _initInput() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    }

    _initAudio() {
        this.audioCtx = null;
        this.engineOsc = null;
        this.engineGain = null;
    }

    _startAudio() {
        if (this.audioStarted) return;
        this.audioStarted = true;

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Engine oscillator
        this.engineOsc = this.audioCtx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 80;

        // Create a more complex engine sound
        const engineOsc2 = this.audioCtx.createOscillator();
        engineOsc2.type = 'square';
        engineOsc2.frequency.value = 60;

        this.engineGain = this.audioCtx.createGain();
        this.engineGain.gain.value = 0.03;

        // Lowpass filter for engine rumble
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 2;
        this.engineFilter = filter;

        // Distortion for grittiness
        const distortion = this.audioCtx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i / 128) - 1;
            curve[i] = Math.tanh(x * 2);
        }
        distortion.curve = curve;

        this.engineOsc.connect(this.engineGain);
        engineOsc2.connect(this.engineGain);
        this.engineGain.connect(distortion);
        distortion.connect(filter);
        filter.connect(this.audioCtx.destination);

        this.engineOsc.start();
        engineOsc2.start();
        this.engineOsc2 = engineOsc2;
    }

    _updateAudio(speed) {
        if (!this.audioCtx) return;

        const absSpeed = Math.abs(speed);
        const speedNorm = Math.min(absSpeed / 60, 1);

        // Engine frequency: 60Hz idle → 300Hz at max speed
        const freq = 60 + speedNorm * 240;
        this.engineOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.1);
        this.engineOsc2.frequency.setTargetAtTime(freq * 0.75, this.audioCtx.currentTime, 0.1);

        // Volume
        const vol = 0.02 + speedNorm * 0.04;
        this.engineGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.1);

        // Filter opens with speed
        const filterFreq = 300 + speedNorm * 800;
        this.engineFilter.frequency.setTargetAtTime(filterFreq, this.audioCtx.currentTime, 0.1);
    }

    _initHUD() {
        this.speedDisplay = document.getElementById('speed-value');
        this.speedBar = document.getElementById('speed-bar-fill');
        this.gearDisplay = document.getElementById('gear-value');
    }

    _updateHUD(speed) {
        const absSpeed = Math.abs(speed);
        const kph = Math.round(absSpeed * 3.6);
        const speedNorm = Math.min(absSpeed / 60, 1);

        this.speedDisplay.textContent = kph;
        this.speedBar.style.width = `${speedNorm * 100}%`;

        // Gear calculation (approximate)
        let gear;
        if (speed < 0) gear = 'R';
        else if (absSpeed < 1) gear = 'N';
        else if (absSpeed < 12) gear = '1';
        else if (absSpeed < 24) gear = '2';
        else if (absSpeed < 36) gear = '3';
        else if (absSpeed < 48) gear = '4';
        else gear = '5';
        this.gearDisplay.textContent = gear;

        // Dynamic HUD glow
        const hud = document.getElementById('hud');
        const glowIntensity = speedNorm * 0.3;
        hud.style.boxShadow = `0 0 ${20 + speedNorm * 30}px rgba(100, 180, 255, ${0.1 + glowIntensity})`;
    }

    _initEvents() {
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
            this.postProcessing.resize(w, h);
        });
    }

    _start() {
        document.getElementById('start-overlay').classList.add('hidden');
        this._startAudio();
        this.isRunning = true;
        this._loop();
    }

    _loop() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this._loop());

        const dt = Math.min(this.clock.getDelta(), 0.05); // Cap delta

        // ---- INPUT ----
        this.car.input.forward = !!this.keys['KeyW'];
        this.car.input.back = !!this.keys['KeyS'];
        this.car.input.left = !!this.keys['KeyA'];
        this.car.input.right = !!this.keys['KeyD'];
        this.car.input.drift = !!this.keys['Space'];

        // ---- UPDATE ----
        this.car.update(dt);
        this.world.update(dt, this.camera.position);
        this.cinematicCamera.update(
            dt,
            this.car.getPosition(),
            this.car.getHeading(),
            this.car.getSpeed(),
            this.car.getTurnSpeed()
        );

        // ---- POST-PROCESSING ----
        this.postProcessing.update(this.car.getSpeedNormalized());
        this.postProcessing.render();

        // ---- AUDIO ----
        this._updateAudio(this.car.getSpeed());

        // ---- HUD ----
        this._updateHUD(this.car.getSpeed());
    }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
