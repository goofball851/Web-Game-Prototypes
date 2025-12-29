# 🔫 TRIGGER HAPPY: Hyper-Rush

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black.svg)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Powered-purple.svg)](https://ai.google.dev/)

**Trigger Happy: Hyper-Rush** is a chaotic, fast-paced arcade FPS runner built for the web. Trapped in a broken testing wing designed to train security AI, you must navigate high-speed corridors, auto-locking onto obstacles and shattering them before they end your run.

---

## 🚀 Core Concept

- **Hyper-Rush Gameplay**: You are always moving forward at high speed. One collision means instant failure.
- **Auto-Lock Targeting**: Your experimental weapon locks onto dangerous objects automatically. Hesitation is fatal.
- **Procedural Runs**: Every session is unique. A "Genetic Flavor Injection" powered by **Google Gemini AI** generates random characters, weapons, and destruction styles.
- **Adaptive Visuals**: The world shifts through multiple visual phases (Neon, Glitch, Pixel, Retro) as you build your score and combos.
- **Combo System**: Destroy obstacles in quick succession to ramp up your efficiency rating and score multiplier.

---

## 🛠️ Tech Stack

- **Engine**: [Three.js](https://threejs.org/) for high-performance 3D rendering and custom particle systems.
- **Frontend**: [React 19](https://reactjs.org/) for UI orchestration and state management.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, cybernetic HUD and CRT-style overlays.
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) to generate wacky, creative run metadata and laboratory commentary.

---

## 🕹️ How to Play

### Controls
| Input | Action |
| :--- | :--- |
| **A / Left Arrow** | Strafe Left |
| **D / Right Arrow** | Strafe Right |
| **Space / Mouse Click** | Pulse Fire (Shoot Target) |
| **Touch Controls** | On-screen HUD buttons provided |

### Rules
1. **Don't Stop**: Speed increases with every phase.
2. **Clear the Path**: Shoot highlighted obstacles before you collide with them.
3. **Build Multipliers**: Quick kills activate the **Combo Meter**, significantly boosting your score.
4. **Reach Phase 100**: Complete the simulation to record your data in the high score terminal.

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/trigger-happy-hyper-rush.git
   cd trigger-happy-hyper-rush
   ```

2. **Set up Environment Variables**:
   Ensure you have a valid **Google Gemini API Key**.
   ```bash
   # Add to your .env or export to shell
   API_KEY=your_gemini_api_key_here
   ```

3. **Install dependencies and start**:
   Since this project uses ESM modules and raw web standards, you can serve it using any local static server (e.g., `npx serve .` or `live-server`).

---

## 🧪 Laboratory Commentary
> *"Keep moving. Or don't. Science doesn't care about your survival, only your efficiency data."* — **[AI_MONITOR]**

Developed as a creative prototype for hyper-speed interaction design. Visuals include CRT effects, chromatic aberration, and high-frequency emissive pulsing.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.