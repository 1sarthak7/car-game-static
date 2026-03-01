import * as THREE from 'three';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();

        // Physics state
        this.speed = 0;
        this.maxSpeed = 60;
        this.acceleration = 25;
        this.brakeForce = 35;
        this.friction = 8;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 2.5;
        this.heading = 0;
        this.lateralVelocity = 0;
        this.isDrifting = false;
        this.driftFactor = 0;
        this.suspensionPhase = 0;

        // Exhaust particles
        this.exhaustParticles = [];
        this.driftParticles = [];

        // Input state
        this.input = { forward: false, back: false, left: false, right: false, drift: false };

        // Build car
        this.wheels = [];
        this.brakeLights = [];
        this.headlights = [];
        this.spotLights = [];
        this._buildCar();

        this.group.position.set(0, 0.5, 0);
        scene.add(this.group);
    }

    _buildCar() {
        // ---- BODY ----
        // Main body
        const bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 4.2);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xcc2233,
            roughness: 0.25,
            metalness: 0.7
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        body.castShadow = true;
        this.group.add(body);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.0);
        const cabinMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.7
        });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.y = 1.3;
        cabin.position.z = -0.2;
        cabin.castShadow = true;
        this.group.add(cabin);

        // Hood slope
        const hoodGeo = new THREE.BoxGeometry(2.0, 0.3, 1.0);
        const hood = new THREE.Mesh(hoodGeo, bodyMat);
        hood.position.set(0, 1.1, 1.4);
        hood.rotation.x = -0.15;
        this.group.add(hood);

        // Trunk slope
        const trunkGeo = new THREE.BoxGeometry(2.0, 0.25, 0.8);
        const trunk = new THREE.Mesh(trunkGeo, bodyMat);
        trunk.position.set(0, 1.05, -1.5);
        trunk.rotation.x = 0.15;
        this.group.add(trunk);

        // Spoiler
        const spoilerGeo = new THREE.BoxGeometry(1.8, 0.08, 0.3);
        const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
        const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
        spoiler.position.set(0, 1.4, -2.0);
        this.group.add(spoiler);

        // Spoiler supports
        [-0.6, 0.6].forEach(x => {
            const supportGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
            const support = new THREE.Mesh(supportGeo, spoilerMat);
            support.position.set(x, 1.25, -1.9);
            this.group.add(support);
        });

        // ---- WHEELS ----
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.3 });
        const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.26, 6);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });

        const wheelPositions = [
            [-1.15, 0.35, 1.3],  // Front-left
            [1.15, 0.35, 1.3],   // Front-right
            [-1.15, 0.35, -1.3], // Rear-left
            [1.15, 0.35, -1.3],  // Rear-right
        ];

        wheelPositions.forEach(([x, y, z], i) => {
            const wheelGroup = new THREE.Group();
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheelGroup.add(wheel);

            const hub = new THREE.Mesh(hubGeo, hubMat);
            hub.rotation.z = Math.PI / 2;
            wheelGroup.add(hub);

            wheelGroup.position.set(x, y, z);
            this.group.add(wheelGroup);
            this.wheels.push({ group: wheelGroup, isFront: i < 2 });
        });

        // ---- HEADLIGHTS ----
        const headlightGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const headlightMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0xffffff,
            emissiveIntensity: 2.0
        });

        [-0.7, 0.7].forEach(x => {
            const hl = new THREE.Mesh(headlightGeo, headlightMat);
            hl.position.set(x, 0.7, 2.1);
            this.group.add(hl);
            this.headlights.push(hl);

            const spot = new THREE.SpotLight(0xffffee, 3, 40, Math.PI / 6, 0.5, 1);
            spot.position.set(x, 0.7, 2.2);
            spot.target.position.set(x, 0, 12);
            this.group.add(spot);
            this.group.add(spot.target);
            this.spotLights.push(spot);
        });

        // ---- BRAKE LIGHTS ----
        const brakeLightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.05);

        [-0.7, 0.7].forEach(x => {
            const blMat = new THREE.MeshStandardMaterial({
                color: 0x330000,
                emissive: 0xff0000,
                emissiveIntensity: 0.3
            });
            const bl = new THREE.Mesh(brakeLightGeo, blMat);
            bl.position.set(x, 0.7, -2.1);
            this.group.add(bl);
            this.brakeLights.push(bl);
        });

        // ---- EXHAUST PIPE ----
        const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
        const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.3 });
        const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
        exhaust.rotation.x = Math.PI / 2;
        exhaust.position.set(0.6, 0.3, -2.2);
        this.group.add(exhaust);

        // Exhaust particle system
        this._createExhaustParticleSystem();
        this._createDriftParticleSystem();

        // Underbody glow
        const underGlowGeo = new THREE.PlaneGeometry(2.0, 4.0);
        const underGlowMat = new THREE.MeshBasicMaterial({
            color: 0x4400ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const underGlow = new THREE.Mesh(underGlowGeo, underGlowMat);
        underGlow.rotation.x = -Math.PI / 2;
        underGlow.position.y = 0.05;
        this.group.add(underGlow);
        this.underGlow = underGlow;
    }

    _createExhaustParticleSystem() {
        const count = 50;
        const positions = new Float32Array(count * 3);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x666666,
            size: 0.15,
            transparent: true,
            opacity: 0.5,
            blending: THREE.NormalBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.exhaustSystem = new THREE.Points(geo, mat);
        this.scene.add(this.exhaustSystem);

        for (let i = 0; i < count; i++) {
            this.exhaustParticles.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0
            });
        }
    }

    _createDriftParticleSystem() {
        const count = 100;
        const positions = new Float32Array(count * 3);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xccbb99,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            blending: THREE.NormalBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.driftSystem = new THREE.Points(geo, mat);
        this.scene.add(this.driftSystem);

        for (let i = 0; i < count; i++) {
            this.driftParticles.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0
            });
        }
    }

    update(dt) {
        // ---- INPUT PROCESSING ----
        const { forward, back, left, right, drift } = this.input;

        // Acceleration / Braking
        if (forward) {
            this.speed += this.acceleration * dt;
        } else if (back) {
            if (this.speed > 0) {
                this.speed -= this.brakeForce * dt;
            } else {
                this.speed -= this.acceleration * 0.5 * dt; // Reverse
            }
        } else {
            // Friction deceleration
            if (Math.abs(this.speed) < 0.5) {
                this.speed = 0;
            } else {
                this.speed -= Math.sign(this.speed) * this.friction * dt;
            }
        }

        // Clamp speed
        this.speed = THREE.MathUtils.clamp(this.speed, -this.maxSpeed * 0.3, this.maxSpeed);

        // Drift mechanics
        this.isDrifting = drift && Math.abs(this.speed) > 10;
        this.driftFactor = THREE.MathUtils.lerp(
            this.driftFactor,
            this.isDrifting ? 1.0 : 0.0,
            dt * 5
        );

        // Steering
        const speedFactor = Math.min(Math.abs(this.speed) / this.maxSpeed, 1.0);
        const steerAmount = speedFactor * this.maxTurnSpeed;
        const gripReduction = this.isDrifting ? 0.6 : 1.0;

        if (left) {
            this.turnSpeed = THREE.MathUtils.lerp(this.turnSpeed, steerAmount, dt * 4);
        } else if (right) {
            this.turnSpeed = THREE.MathUtils.lerp(this.turnSpeed, -steerAmount, dt * 4);
        } else {
            this.turnSpeed = THREE.MathUtils.lerp(this.turnSpeed, 0, dt * 6);
        }

        // Apply heading
        if (Math.abs(this.speed) > 0.5) {
            this.heading += this.turnSpeed * gripReduction * dt;
        }

        // Lateral velocity (drift slide)
        if (this.isDrifting) {
            this.lateralVelocity = THREE.MathUtils.lerp(
                this.lateralVelocity,
                -this.turnSpeed * this.speed * 0.08,
                dt * 3
            );
        } else {
            this.lateralVelocity = THREE.MathUtils.lerp(this.lateralVelocity, 0, dt * 5);
        }

        // Update position
        const moveX = Math.sin(this.heading) * this.speed * dt + Math.cos(this.heading) * this.lateralVelocity * dt;
        const moveZ = Math.cos(this.heading) * this.speed * dt - Math.sin(this.heading) * this.lateralVelocity * dt;
        this.group.position.x += moveX;
        this.group.position.z += moveZ;

        // Update rotation
        this.group.rotation.y = this.heading;

        // ---- SUSPENSION ----
        this.suspensionPhase += dt * (5 + Math.abs(this.speed) * 0.3);
        const suspensionBob = Math.sin(this.suspensionPhase) * 0.02 * speedFactor;
        this.group.position.y = 0.5 + suspensionBob;

        // Body lean during turning
        const leanAngle = -this.turnSpeed * 0.05;
        this.group.children[0].rotation.z = THREE.MathUtils.lerp(
            this.group.children[0].rotation.z || 0,
            leanAngle,
            dt * 5
        );

        // ---- WHEEL ANIMATION ----
        const wheelSpinSpeed = this.speed * 2;
        this.wheels.forEach(({ group: wg, isFront }) => {
            // Spin
            wg.children[0].rotation.x += wheelSpinSpeed * dt;
            wg.children[1].rotation.x += wheelSpinSpeed * dt;
            // Front wheel steering
            if (isFront) {
                wg.rotation.y = THREE.MathUtils.lerp(wg.rotation.y, this.turnSpeed * 0.3, dt * 8);
            }
        });

        // ---- BRAKE LIGHTS ----
        const brakeIntensity = back ? 2.5 : 0.3;
        this.brakeLights.forEach(bl => {
            bl.material.emissiveIntensity = THREE.MathUtils.lerp(
                bl.material.emissiveIntensity,
                brakeIntensity,
                dt * 10
            );
        });

        // ---- UNDERBODY GLOW ----
        this.underGlow.material.opacity = 0.1 + speedFactor * 0.15;

        // ---- EXHAUST PARTICLES ----
        this._updateExhaustParticles(dt);
        if (this.isDrifting) {
            this._updateDriftParticles(dt);
        } else {
            this._fadeDriftParticles(dt);
        }
    }

    _updateExhaustParticles(dt) {
        const exhaustWorldPos = new THREE.Vector3(0.6, 0.3, -2.3);
        exhaustWorldPos.applyMatrix4(this.group.matrixWorld);

        const positions = this.exhaustSystem.geometry.attributes.position.array;
        const spawnRate = Math.abs(this.speed) > 2 ? 3 : 1;

        this.exhaustParticles.forEach((p, i) => {
            p.life -= dt;

            if (p.life <= 0 && Math.random() < spawnRate * dt * 10) {
                // Respawn
                p.position.copy(exhaustWorldPos);
                p.velocity.set(
                    (Math.random() - 0.5) * 0.5,
                    0.3 + Math.random() * 0.5,
                    -Math.sin(this.heading) * 1 + (Math.random() - 0.5) * 0.3
                );
                p.maxLife = 0.5 + Math.random() * 0.5;
                p.life = p.maxLife;
            }

            if (p.life > 0) {
                p.position.add(p.velocity.clone().multiplyScalar(dt));
                p.velocity.y += dt * 0.5; // Rise
            }

            positions[i * 3] = p.life > 0 ? p.position.x : -9999;
            positions[i * 3 + 1] = p.life > 0 ? p.position.y : -9999;
            positions[i * 3 + 2] = p.life > 0 ? p.position.z : -9999;
        });

        this.exhaustSystem.geometry.attributes.position.needsUpdate = true;
    }

    _updateDriftParticles(dt) {
        // Spawn from rear wheels
        const rearLeftPos = new THREE.Vector3(-1.15, 0.1, -1.3);
        const rearRightPos = new THREE.Vector3(1.15, 0.1, -1.3);
        rearLeftPos.applyMatrix4(this.group.matrixWorld);
        rearRightPos.applyMatrix4(this.group.matrixWorld);

        const positions = this.driftSystem.geometry.attributes.position.array;

        this.driftParticles.forEach((p, i) => {
            p.life -= dt;

            if (p.life <= 0 && Math.random() < 30 * dt) {
                const src = Math.random() > 0.5 ? rearLeftPos : rearRightPos;
                p.position.copy(src);
                p.velocity.set(
                    (Math.random() - 0.5) * 2,
                    0.5 + Math.random() * 1.5,
                    (Math.random() - 0.5) * 2
                );
                p.maxLife = 0.3 + Math.random() * 0.5;
                p.life = p.maxLife;
            }

            if (p.life > 0) {
                p.position.add(p.velocity.clone().multiplyScalar(dt));
                p.velocity.y -= dt * 2; // Gravity
            }

            positions[i * 3] = p.life > 0 ? p.position.x : -9999;
            positions[i * 3 + 1] = p.life > 0 ? p.position.y : -9999;
            positions[i * 3 + 2] = p.life > 0 ? p.position.z : -9999;
        });

        this.driftSystem.geometry.attributes.position.needsUpdate = true;
    }

    _fadeDriftParticles(dt) {
        const positions = this.driftSystem.geometry.attributes.position.array;
        this.driftParticles.forEach((p, i) => {
            p.life -= dt;
            if (p.life > 0) {
                p.position.add(p.velocity.clone().multiplyScalar(dt));
                p.velocity.y -= dt * 2;
            }
            positions[i * 3] = p.life > 0 ? p.position.x : -9999;
            positions[i * 3 + 1] = p.life > 0 ? p.position.y : -9999;
            positions[i * 3 + 2] = p.life > 0 ? p.position.z : -9999;
        });
        this.driftSystem.geometry.attributes.position.needsUpdate = true;
    }

    getPosition() {
        return this.group.position;
    }

    getHeading() {
        return this.heading;
    }

    getSpeed() {
        return this.speed;
    }

    getSpeedNormalized() {
        return Math.abs(this.speed) / this.maxSpeed;
    }

    getTurnSpeed() {
        return this.turnSpeed;
    }

    getExhaustScreenPosition(camera) {
        const exhaustPos = new THREE.Vector3(0.6, 0.3, -2.3);
        exhaustPos.applyMatrix4(this.group.matrixWorld);
        exhaustPos.project(camera);
        return new THREE.Vector2(
            (exhaustPos.x + 1) / 2,
            (exhaustPos.y + 1) / 2
        );
    }
}
