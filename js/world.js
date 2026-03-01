import * as THREE from 'three';
import { SkyShader } from './shaders/skyShader.js';
import { RoadShader } from './shaders/roadShader.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.trafficLights = [];
        this.particles = null;
        this.skyUniforms = null;
        this.roadUniforms = null;
        this.lightBeams = [];

        this._buildGround();
        this._buildRoads();
        this._buildBuildings();
        this._buildStreetLights();
        this._buildNeonSigns();
        this._buildTrafficSignals();
        this._buildParticles();
        this._buildSkyDome();
        this._buildLightBeams();
        this._setupFog();
        this._setupLighting();
    }

    _setupLighting() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4);
        this.scene.add(ambient);

        // Directional (moon/sun)
        const dirLight = new THREE.DirectionalLight(0xffe4c4, 0.6);
        dirLight.position.set(50, 80, 30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.camera.left = -80;
        dirLight.shadow.camera.right = 80;
        dirLight.shadow.camera.top = 80;
        dirLight.shadow.camera.bottom = -80;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);

        // Hemisphere light for sky color fill
        const hemi = new THREE.HemisphereLight(0x2a1a3a, 0x1a1a1a, 0.3);
        this.scene.add(hemi);
    }

    _setupFog() {
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);
    }

    _buildGround() {
        const geo = new THREE.PlaneGeometry(300, 300);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1a2a1a,
            roughness: 0.9,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(geo, mat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    _buildRoads() {
        const roadShaderMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uCameraPosition: { value: new THREE.Vector3() }
            },
            vertexShader: RoadShader.vertexShader,
            fragmentShader: RoadShader.fragmentShader
        });
        this.roadUniforms = roadShaderMat.uniforms;

        // Main road along Z
        const roadGeo1 = new THREE.PlaneGeometry(16, 300, 1, 1);
        const road1 = new THREE.Mesh(roadGeo1, roadShaderMat);
        road1.rotation.x = -Math.PI / 2;
        road1.position.y = 0.01;
        road1.receiveShadow = true;
        this.scene.add(road1);

        // Cross road along X
        const roadGeo2 = new THREE.PlaneGeometry(300, 16, 1, 1);
        const crossRoadMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: roadShaderMat.uniforms.uTime,
                uCameraPosition: roadShaderMat.uniforms.uCameraPosition
            },
            vertexShader: RoadShader.vertexShader,
            fragmentShader: RoadShader.fragmentShader
        });
        const road2 = new THREE.Mesh(roadGeo2, crossRoadMat);
        road2.rotation.x = -Math.PI / 2;
        road2.position.y = 0.01;
        road2.receiveShadow = true;
        this.scene.add(road2);

        // Additional parallel roads
        const offsets = [-50, 50];
        offsets.forEach(offset => {
            const rGeo = new THREE.PlaneGeometry(12, 300);
            const r = new THREE.Mesh(rGeo, roadShaderMat.clone());
            r.rotation.x = -Math.PI / 2;
            r.position.set(offset, 0.01, 0);
            r.receiveShadow = true;
            this.scene.add(r);

            const rGeo2 = new THREE.PlaneGeometry(300, 12);
            const r2 = new THREE.Mesh(rGeo2, roadShaderMat.clone());
            r2.rotation.x = -Math.PI / 2;
            r2.position.set(0, 0.01, offset);
            r2.receiveShadow = true;
            this.scene.add(r2);
        });
    }

    _buildBuildings() {
        const buildingColors = [
            0x2a2a3e, 0x3a2a4e, 0x2a3a4e, 0x4a2a3e,
            0x3a3a5e, 0x2a4a5e, 0x4a3a4e, 0x3a2a6e,
            0x5a3a4e, 0x2a2a5e, 0x4a4a5e, 0x3a4a6e
        ];

        // Instanced buildings for performance
        const positions = [];
        const zones = [
            { xMin: 12, xMax: 45, zMin: -140, zMax: 140 },   // Right of main road
            { xMin: -45, xMax: -12, zMin: -140, zMax: 140 },  // Left of main road
            { xMin: -140, xMax: -55, zMin: 12, zMax: 140 },   // Far left top
            { xMin: -140, xMax: -55, zMin: -140, zMax: -12 }, // Far left bottom
            { xMin: 55, xMax: 140, zMin: 12, zMax: 140 },     // Far right top
            { xMin: 55, xMax: 140, zMin: -140, zMax: -12 },   // Far right bottom
        ];

        zones.forEach(zone => {
            for (let i = 0; i < 20; i++) {
                const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
                const z = zone.zMin + Math.random() * (zone.zMax - zone.zMin);
                const w = 4 + Math.random() * 8;
                const h = 6 + Math.random() * 30;
                const d = 4 + Math.random() * 8;
                const colorIdx = Math.floor(Math.random() * buildingColors.length);

                const geo = new THREE.BoxGeometry(w, h, d);
                const mat = new THREE.MeshStandardMaterial({
                    color: buildingColors[colorIdx],
                    roughness: 0.7,
                    metalness: 0.2
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(x, h / 2, z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.scene.add(mesh);

                // Windows – emissive spots
                if (h > 12) {
                    this._addWindows(mesh, w, h, d, x, z);
                }
            }
        });
    }

    _addWindows(building, w, h, d, bx, bz) {
        const windowGeo = new THREE.PlaneGeometry(0.8, 1.0);
        const windowColors = [0xffdd44, 0x44ddff, 0xffaa22, 0xffffff];

        for (let face = 0; face < 4; face++) {
            const numFloors = Math.floor(h / 3.5);
            const numWindows = Math.floor((face % 2 === 0 ? w : d) / 2.5);

            for (let floor = 1; floor < numFloors; floor++) {
                for (let wi = 0; wi < numWindows; wi++) {
                    if (Math.random() > 0.6) continue; // some windows dark

                    const mat = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        emissive: windowColors[Math.floor(Math.random() * windowColors.length)],
                        emissiveIntensity: 0.3 + Math.random() * 0.7
                    });
                    const win = new THREE.Mesh(windowGeo, mat);

                    const y = floor * 3.5 - h / 2 + 1.5;
                    const spread = (face % 2 === 0 ? w : d) * 0.4;
                    const offset = (wi / Math.max(numWindows - 1, 1) - 0.5) * spread * 2;

                    switch (face) {
                        case 0: win.position.set(offset, y, d / 2 + 0.01); break;
                        case 1: win.position.set(offset, y, -d / 2 - 0.01); win.rotation.y = Math.PI; break;
                        case 2: win.position.set(w / 2 + 0.01, y, offset); win.rotation.y = Math.PI / 2; break;
                        case 3: win.position.set(-w / 2 - 0.01, y, offset); win.rotation.y = -Math.PI / 2; break;
                    }
                    building.add(win);
                }
            }
        }
    }

    _buildStreetLights() {
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 6, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
        const lampGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0xffcc66,
            emissiveIntensity: 2.0
        });

        const positions = [];
        for (let z = -130; z <= 130; z += 20) {
            positions.push([9, z], [-9, z]);
        }
        for (let x = -130; x <= 130; x += 20) {
            positions.push([x, 9], [x, -9]);
        }

        positions.forEach(([x, z]) => {
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(x, 3, z);
            pole.castShadow = true;
            this.scene.add(pole);

            const lamp = new THREE.Mesh(lampGeo, lampMat);
            lamp.position.set(x, 6.2, z);
            this.scene.add(lamp);

            const light = new THREE.PointLight(0xffcc66, 1.5, 25, 2);
            light.position.set(x, 6, z);
            light.castShadow = false; // Performance: only directional casts shadows
            this.scene.add(light);
        });
    }

    _buildNeonSigns() {
        const neonColors = [0xff0066, 0x00ffcc, 0xff6600, 0xaa00ff, 0x00aaff, 0xffff00];
        const signGeo = new THREE.BoxGeometry(3, 1, 0.2);

        for (let i = 0; i < 30; i++) {
            const col = neonColors[Math.floor(Math.random() * neonColors.length)];
            const mat = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: col,
                emissiveIntensity: 1.5
            });
            const sign = new THREE.Mesh(signGeo, mat);

            const side = Math.random() > 0.5 ? 1 : -1;
            const axis = Math.random() > 0.5;
            const pos = -100 + Math.random() * 200;
            const h = 5 + Math.random() * 15;

            if (axis) {
                sign.position.set(side * (12 + Math.random() * 30), h, pos);
                sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
            } else {
                sign.position.set(pos, h, side * (12 + Math.random() * 30));
            }
            this.scene.add(sign);
        }
    }

    _buildTrafficSignals() {
        const signalPositions = [
            [8, 0], [-8, 0], [0, 8], [0, -8],
            [8, 50], [-8, 50], [8, -50], [-8, -50],
            [50, 8], [50, -8], [-50, 8], [-50, -8]
        ];

        signalPositions.forEach(([x, z]) => {
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 6);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(x, 2.5, z);
            this.scene.add(pole);

            const boxGeo = new THREE.BoxGeometry(0.6, 1.6, 0.4);
            const boxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(x, 5.3, z);
            this.scene.add(box);

            // Three lights
            const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
            const colors = [0xff0000, 0xffaa00, 0x00ff00];
            const lights = [];
            colors.forEach((col, idx) => {
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x111111,
                    emissive: col,
                    emissiveIntensity: 0.0
                });
                const l = new THREE.Mesh(lightGeo, mat);
                l.position.set(x, 5.8 - idx * 0.5, z + 0.22);
                this.scene.add(l);
                lights.push({ mesh: l, color: col });
            });

            this.trafficLights.push({
                lights,
                phase: Math.random() * Math.PI * 2,
                position: new THREE.Vector3(x, 5.3, z)
            });
        });
    }

    _buildParticles() {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            sizes[i] = 0.05 + Math.random() * 0.15;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color: 0xffeedd,
            size: 0.12,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    _buildSkyDome() {
        const skyGeo = new THREE.SphereGeometry(400, 32, 32);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSunPosition: { value: new THREE.Vector3(50, 30, -100) }
            },
            vertexShader: SkyShader.vertexShader,
            fragmentShader: SkyShader.fragmentShader,
            side: THREE.BackSide,
            depthWrite: false
        });
        this.skyUniforms = skyMat.uniforms;
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyDome);
    }

    _buildLightBeams() {
        const beamGeo = new THREE.ConeGeometry(3, 12, 8, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0xffcc66,
            transparent: true,
            opacity: 0.04,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const beamPositions = [
            [9, 0], [-9, 0], [9, 40], [-9, 40],
            [9, -40], [-9, -40], [9, 80], [-9, 80]
        ];

        beamPositions.forEach(([x, z]) => {
            const beam = new THREE.Mesh(beamGeo, beamMat.clone());
            beam.position.set(x, 0, z);
            beam.rotation.x = Math.PI; // Point downward
            this.scene.add(beam);
            this.lightBeams.push(beam);
        });
    }

    update(dt, cameraPosition) {
        this.time += dt;

        // Update shader uniforms
        if (this.skyUniforms) {
            this.skyUniforms.uTime.value = this.time;
        }
        if (this.roadUniforms) {
            this.roadUniforms.uTime.value = this.time;
            if (cameraPosition) {
                this.roadUniforms.uCameraPosition.value.copy(cameraPosition);
            }
        }

        // Animate traffic lights
        this.trafficLights.forEach(tl => {
            const cycle = (this.time * 0.5 + tl.phase) % (Math.PI * 2);
            const activeIdx = cycle < 2.0 ? 2 : (cycle < 3.5 ? 1 : 0);
            tl.lights.forEach((l, idx) => {
                l.mesh.material.emissiveIntensity = idx === activeIdx ? 1.5 : 0.05;
            });
        });

        // Animate particles (gentle float)
        if (this.particles) {
            const pos = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += Math.sin(this.time + pos[i]) * 0.002;
                pos[i] += Math.cos(this.time * 0.5 + pos[i + 2]) * 0.001;
                // Reset particles that drift too high
                if (pos[i + 1] > 30) pos[i + 1] = 0;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Pulse light beams
        this.lightBeams.forEach((beam, i) => {
            beam.material.opacity = 0.03 + Math.sin(this.time * 0.8 + i) * 0.015;
        });
    }
}
