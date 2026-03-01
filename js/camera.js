import * as THREE from 'three';

export class CinematicCamera {
    constructor(camera) {
        this.camera = camera;
        this.baseFov = 65;
        this.maxFov = 85;
        this.camera.fov = this.baseFov;
        this.camera.updateProjectionMatrix();

        // Follow parameters
        this.offset = new THREE.Vector3(0, 4, -8);
        this.lookAtOffset = new THREE.Vector3(0, 1.5, 4);
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.initialized = false;

        // Smoothing
        this.positionLerp = 2.5;
        this.lookAtLerp = 4.0;

        // Shake
        this.shakeIntensity = 0;
        this.shakeOffset = new THREE.Vector3();

        // Tilt
        this.currentTilt = 0;
    }

    update(dt, carPosition, carHeading, speed, turnSpeed) {
        const speedNorm = Math.min(Math.abs(speed) / 60, 1.0);

        // ---- DYNAMIC FOV ----
        const targetFov = this.baseFov + (this.maxFov - this.baseFov) * speedNorm * speedNorm;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 3);
        this.camera.updateProjectionMatrix();

        // ---- TARGET POSITION ----
        // Calculate offset rotated by car heading
        const cosH = Math.cos(carHeading);
        const sinH = Math.sin(carHeading);

        const rotatedOffset = new THREE.Vector3(
            this.offset.x * cosH + this.offset.z * sinH,
            this.offset.y,
            -this.offset.x * sinH + this.offset.z * cosH
        );

        // Dynamic distance: pull back at high speed
        const speedPullBack = 1 + speedNorm * 0.5;
        rotatedOffset.x *= speedPullBack;
        rotatedOffset.z *= speedPullBack;

        const targetPos = new THREE.Vector3().addVectors(carPosition, rotatedOffset);

        // ---- TARGET LOOK AT ----
        const rotatedLookAt = new THREE.Vector3(
            this.lookAtOffset.x * cosH + this.lookAtOffset.z * sinH,
            this.lookAtOffset.y,
            -this.lookAtOffset.x * sinH + this.lookAtOffset.z * cosH
        );
        const targetLookAt = new THREE.Vector3().addVectors(carPosition, rotatedLookAt);

        // ---- INITIALIZE OR LERP ----
        if (!this.initialized) {
            this.currentPosition.copy(targetPos);
            this.currentLookAt.copy(targetLookAt);
            this.initialized = true;
        } else {
            // Slower lerp at high speed for more cinematic lag
            const posLerp = this.positionLerp * (1 - speedNorm * 0.3);
            this.currentPosition.lerp(targetPos, 1 - Math.exp(-posLerp * dt));
            this.currentLookAt.lerp(targetLookAt, 1 - Math.exp(-this.lookAtLerp * dt));
        }

        // ---- CAMERA SHAKE ----
        this.shakeIntensity = speedNorm * speedNorm * 0.06;
        this.shakeOffset.set(
            (Math.random() - 0.5) * this.shakeIntensity,
            (Math.random() - 0.5) * this.shakeIntensity * 0.5,
            (Math.random() - 0.5) * this.shakeIntensity
        );

        // ---- APPLY POSITION ----
        this.camera.position.copy(this.currentPosition).add(this.shakeOffset);
        this.camera.lookAt(this.currentLookAt);

        // ---- CAMERA TILT ----
        const targetTilt = -turnSpeed * 0.04;
        this.currentTilt = THREE.MathUtils.lerp(this.currentTilt, targetTilt, dt * 4);
        this.camera.rotation.z += this.currentTilt;
    }
}
