<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=900&size=42&duration=3000&pause=500&color=FF4466&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=110&lines=%F0%9F%8F%8E%EF%B8%8F+VELOCITY+REALM;Cinematic+Web+Driving+World" alt="Velocity Realm" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white" />
  <img src="https://img.shields.io/badge/GLSL_Shaders-5586A4?style=for-the-badge&logo=opengl&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/1sarthak7/car-game-static?style=social" />
  <img src="https://img.shields.io/github/forks/1sarthak7/car-game-static?style=social" />
  <img src="https://img.shields.io/github/watchers/1sarthak7/car-game-static?style=social" />
  <img src="https://img.shields.io/github/license/1sarthak7/car-game-static?color=blue" />
  <img src="https://img.shields.io/github/repo-size/1sarthak7/car-game-static?color=orange" />
</p>

<br/>

<div align="center">

> *A production-grade, cinematic browser driving experience — Roblox geometry meets Unreal Engine lighting.*
> 
> **No frameworks. No build tools. Pure Three.js + Custom GLSL.**

</div>

<br/>

---

<h2 align="center">🌆 Experience</h2>

<table align="center">
<tr>
<td align="center" width="50%">

### 🎬 Cinematic Start Screen
Animated gradient title with glassmorphism<br/>controls overlay and pulsing call-to-action

</td>
<td align="center" width="50%">

### 🏙️ Open World City
120+ procedural buildings with lit windows,<br/>neon signs, traffic signals, and floating particles

</td>
</tr>
<tr>
<td align="center">

### 🚗 Physics-Based Driving
Acceleration, friction, drift mechanics,<br/>suspension bounce, and exhaust particles

</td>
<td align="center">

### 🎥 Cinematic Camera
Smooth lerp follow, speed-based FOV zoom,<br/>camera shake, and roll tilt on turns

</td>
</tr>
</table>

---

<h2 align="center">✨ Feature Highlights</h2>

<div align="center">

|  | Feature | Details |
|:---:|:---|:---|
| 🎨 | **3 Custom GLSL Shaders** | Animated sky dome with stars & clouds, wet reflective road, exhaust heat distortion |
| 🌃 | **Procedural City** | Low-poly buildings, glowing windows, neon signs, animated traffic signals |
| 🏎️ | **Car Physics Engine** | Velocity, acceleration, friction, drift with dust particles, brake lights |
| 🎥 | **Cinematic Camera** | Smooth follow, dynamic FOV, speed shake, turn tilt — feels filmic |
| 💡 | **Advanced Lighting** | ACESFilmic tone mapping, street lights, underbody neon glow, light beams |
| 🌸 | **PostProcessing Pipeline** | UnrealBloomPass, FXAA, custom vignette — all speed-reactive |
| 🔊 | **Web Audio Engine Sound** | Dual-oscillator synthesis with distortion & lowpass filter |
| 🖥️ | **Glassmorphism HUD** | Speedometer, gear indicator, dynamic glow — Apple-level polish |
| ✨ | **Ambient Particles** | 2000 floating dust motes with additive blending |
| 🌅 | **Animated Sky Dome** | Procedural sunset gradient, twinkling stars, drifting clouds |

</div>

---

<h2 align="center">🎮 Controls</h2>

<div align="center">

```
╔══════════════════════════════════════════╗
║                                          ║
║          [ W ] — Accelerate              ║
║          [ S ] — Brake / Reverse         ║
║          [ A ] — Steer Left              ║
║          [ D ] — Steer Right             ║
║        [SPACE] — Drift 🔥               ║
║                                          ║
╚══════════════════════════════════════════╝
```

</div>

---

<h2 align="center">📂 Project Architecture</h2>

```
🏎️ car-game-static/
├── 📄 index.html                    # Game shell + Three.js importmap + HUD
├── 🎨 styles.css                    # Glassmorphism HUD + cinematic overlay
├── 📂 js/
│   ├── 🎮 main.js                   # Game loop, renderer, audio, input, HUD
│   ├── 🌆 world.js                  # Procedural city, buildings, roads, lights
│   ├── 🚗 car.js                    # Car model, physics, particles, lights
│   ├── 🎥 camera.js                 # Cinematic follow camera system
│   ├── 📂 shaders/
│   │   ├── 🌌 skyShader.js          # Animated sky gradient + stars + clouds
│   │   ├── 🛤️ roadShader.js         # Wet reflective road with light streaks
│   │   └── 🔥 heatDistortion.js     # Exhaust heat shimmer effect
│   └── 📂 postprocessing/
│       └── 💫 pipeline.js           # Bloom + FXAA + Vignette composer
└── 📖 README.md
```

---

<h2 align="center">🚀 Quick Start</h2>

<div align="center">

```bash
# Clone the repo
git clone https://github.com/1sarthak7/car-game-static.git

# Navigate into it
cd car-game-static

# Serve locally (any static server works)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

</div>

> [!TIP]
> No `npm install`. No build step. Just serve and play. Works on **GitHub Pages** and **Netlify** out of the box.

---

<h2 align="center">🛠️ Tech Stack Deep Dive</h2>

<div align="center">

```mermaid
graph TB
    A[" Game Loop<br/>(main.js)"] --> B[" World System<br/>(world.js)"]
    A --> C[" Car Physics<br/>(car.js)"]
    A --> D[" Camera<br/>(camera.js)"]
    A --> E[" PostProcessing<br/>(pipeline.js)"]
    A --> F[" Web Audio API"]
    
    B --> G[" Sky Shader<br/>GLSL"]
    B --> H[" Road Shader<br/>GLSL"]
    C --> I[" Heat Distortion<br/>GLSL"]
    
    E --> J["UnrealBloomPass"]
    E --> K["FXAA"]
    E --> L["Vignette Shader"]
    
    style A fill:#ff4466,color:#fff,stroke:#ff4466
    style B fill:#44ddff,color:#000,stroke:#44ddff
    style C fill:#ff8844,color:#fff,stroke:#ff8844
    style D fill:#aa66ff,color:#fff,stroke:#aa66ff
    style E fill:#ffcc44,color:#000,stroke:#ffcc44
    style F fill:#00ff88,color:#000,stroke:#00ff88
```

</div>

---

<h2 align="center">🎨 Rendering Pipeline</h2>

<div align="center">

| Stage | Technology | Effect |
|:---:|:---|:---|
| 1️⃣ | `ACESFilmicToneMapping` | Cinematic color reproduction |
| 2️⃣ | `PCFSoftShadowMap` | Soft real-time shadows |
| 3️⃣ | `FogExp2` | Atmospheric depth fog |
| 4️⃣ | `UnrealBloomPass` | Cinematic glow (speed-reactive) |
| 5️⃣ | `FXAA` | Edge anti-aliasing |
| 6️⃣ | `Custom Vignette` | Speed-reactive screen darkening |

</div>

---

<h2 align="center">🌟 What Makes This Different</h2>

<div align="center">

```diff
-  Basic cube car with static camera
+  Detailed car model with spoiler, cabin, and underbody neon glow

-  No lighting or flat shading
+  ACESFilmic tone mapping + soft shadows + street lights + bloom

-  No postprocessing
+  UnrealBloom + FXAA + speed-reactive vignette pipeline

-  No shaders
+  3 custom GLSL shaders (sky, road, heat distortion)

-  Tutorial-level code
+  Production-grade ES module architecture
```

</div>

---

<h2 align="center">📱 Browser Compatibility</h2>

<div align="center">

| Browser | Status |
|:---:|:---:|
| Chrome 90+ |  Full Support |
| Firefox 90+ |  Full Support |
| Safari 15+ |  Full Support |
| Edge 90+ | Full Support |
| Mobile Chrome | Touch controls not yet added |

</div>

---

<h2 align="center">🤝 Contributing</h2>

<div align="center">

Contributions are welcome! Feel free to open issues or submit PRs.

```
Fork → Branch → Code → PR → 🎉
```

</div>

---


<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=16&duration=3000&pause=1000&color=44DDFF&center=true&vCenter=true&repeat=true&width=435&lines=Built+with+%E2%9D%A4%EF%B8%8F+by+%401sarthak7;Powered+by+Three.js+%2B+Custom+GLSL;Zero+dependencies.+Pure+web+magic." alt="Footer" />
</p>

<p align="center">
  <a href="https://github.com/1sarthak7">
    <img src="https://img.shields.io/badge/GitHub-1sarthak7-181717?style=for-the-badge&logo=github" />
  </a>
</p>

<p align="center">
  <b>⭐ If you like this project, give it a star! ⭐</b>
</p>
