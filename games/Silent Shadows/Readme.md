# Silent Shadows

<img width="500" height="500" alt="DALL·E 2025-10-30 13 35 03 - Create a super minimalistic pixel art style video game poster for a stealth indie game titled &#39;Silent Shadows&#39;  Use a dark background and bold white p" src="https://github.com/user-attachments/assets/4a1f1a90-65bd-4a65-9b69-f953bd6b6ed5" />

![Status](https://img.shields.io/badge/Status-Prototype-cyan)
![Engine](https://img.shields.io/badge/Engine-Custom_Canvas_2D-blue)
![AI](https://img.shields.io/badge/AI-Gemini_3_Flash-orange)

**Silent Shadows** is a high-fidelity stealth side-scrolling prototype built with React and a custom 2D physics engine. A high-fidelity stealth side-scrolling prototype featuring dynamic lighting, AI detection mechanics, and a gritty noir aesthetic. Use decoys and shadows to infiltrate the facility.

## 🌃 Visual Aesthetic

The game utilizes a "Cyber-Noir" visual style, featuring:
- **Multi-layered Parallax:** Dynamic depth with structural and city silhouettes.
- **CRT Post-Processing:** CSS-based scanlines and screen-glow effects for a retro-security feed feel.
- **Dynamic Lighting:** Real-time field-of-view (FOV) rendering for guard vision cones.
- **Holographic UI:** Minimalist, high-contrast HUD elements with "terminal-style" feedback.

## 🛠 Technical Features

### Generative Mission Intel
Each deployment is preceded by a unique mission briefing generated via the **Google Gemini API**. This ensures that the high-stakes narrative context feels dynamic and professionally curated.

### Advanced AI Systems
- **Investigation Loop:** Guards transition between Patrol, Investigate, and Search states.
- **Noise Detection:** Visual "Pings" represent sound. Guards will move to investigate pings caused by player actions.
- **Anti-Stuck Logic:** Intelligent collision handling ensures guards navigate complex level geometry without interruption.
- **Detection Index:** A multi-stage alert meter that triggers "Aborted" status upon threshold breach.

### Custom Physics & Collision
- **AABB Collision Resolution:** Precise horizontal and vertical collision handling.
- **Coyote Time:** A platforming "grace period" that allows for more forgiving jump timing at ledge edges.
- **Variable Movement Speeds:** Dedicated sneak, run, and "bold" speeds depending on the player's tactical state.

## 🎮 Gameplay Mechanics

### Stealth Techniques
- **Shadow Blending:** Stand still in dark "Blend Zones" to become virtually invisible to standard patrol cones.
- **Optical Camouflage:** Close your goggles (Space) to hide your own bioluminescent signature, though this limits your movement speed.
- **Tactical Decoys:** Deploy high-frequency decoys (E) to draw guard attention away from your current position.

### Navigation Challenges
The facility is divided into multiple sectors separated by **Structural Barriers**. Each barrier requires a specific tactical approach:
- **Low-Clearance:** Blast doors that require "Passing Under."
- **High-Clearance:** Generators or structural columns that require "Jumping Over."

## ⌨️ Controls

| Key | Action |
|-----|--------|
| **A / D** | Move Left / Right |
| **W** | Jump (Includes Coyote Time) |
| **SHIFT** | Sneak (Reduces noise) |
| **SPACE** | Toggle Night-Vision Goggles (Stealth vs. Visibility) |
| **E** | Deploy Tactical Decoy |

## 🚀 Development Setup

1. **Environment:** Ensure your `process.env.API_KEY` is configured with a valid Google Gemini API key.
2. **Installation:** Standard `npm install` for dependencies.
3. **Execution:** Runs via a modern ESM module loader as defined in the project root.

---

*Developed by an AI Senior Frontend Engineer with a focus on high-performance Canvas rendering and immersive UX.*

## 📄 License

This project is generated with Google AI Studio and is shared for experimentation and development purposes.
