# Silent Shadows

<img width="500" height="500" alt="DALL·E 2025-10-30 13 35 03 - Create a super minimalistic pixel art style video game poster for a stealth indie game titled &#39;Silent Shadows&#39;  Use a dark background and bold white p" src="https://github.com/user-attachments/assets/4a1f1a90-65bd-4a65-9b69-f953bd6b6ed5" />


**Silent Shadows** is a minimalist indie stealth game prototype inspired by *CounterSpy* and mid-century **Saul Bass–style** poster design.  
The game emphasizes silhouettes, restraint, and intentional movement — where **standing still can be safer than moving**.

This repository contains a **browser-based prototype** built to validate core stealth mechanics before transitioning to a Unity 2.5D build.

---

## 🎮 Core Idea

- Stealth through **absence**, not constant action  
- Visibility driven by **movement, line of sight, and blending**
- Minimalist visuals using flat shapes and bold color blocks
- Limited-use tools that force meaningful decisions

---

## 🕵️ Gameplay Mechanics

### Player
- Side-scrolling movement
- Jumping between platforms
- Sneak mode to reduce detection
- Ability to close/open eyes when stationary
- **Blending only works when:**
  - The player is inside a blend zone  
  - The player is standing still  

### Detection Rules
Guards can detect the player when:
- The player moves inside their vision cone
- The player’s glowing eyes are visible at close range
- There is a clear **line of sight** (walls block vision)

If detected while **not blended**, guards investigate the player’s **last known position** instead of instantly failing the mission.

---

## 🥽 Decoy Goggles

The player carries a limited-use decoy item:

- Can be used **1–2 times per mission**
- Tossed goggles stick to surfaces
- Guards will:
  1. Break patrol
  2. Move to the decoy
  3. Search the area briefly
  4. Resume patrol

While a decoy is active:
- The player enters **bold movement mode**
- Sneaking is disabled
- Eyes are forced closed

---

## 👁️ Enemy AI

- Side-scrolling patrol routes
- Vision cones with rotation and sweep
- **Line-of-sight checks** (no seeing through walls)
- Investigation states:
  - Patrol
  - Investigate (decoy or last seen position)
  - Search (pause + cone sweep)

---

## 🧱 Level Design Philosophy

- Levels built from **simple planes and rectangles**
- Blend zones act as visual camouflage
- Levels are composed like **animated posters**
- Planned future direction:
  - 3D planes
  - Flat / cel shading
  - Layered parallax depth
  - Saul Bass–inspired compositions

---

## 🧪 Prototype Status

This repository includes:
- A playable **HTML + Canvas side-scroller**
- No external libraries
- Vanilla JavaScript only
- Designed as a **mechanics reference**, not a final engine

A full rebuild is planned in **Unity (2.5D)**.

---

## ▶️ How to Run

### Option 1 — Local
1. Download or clone the repository
2. Open `silent_shadows_sidescroller.html` in any modern browser

### Option 2 — GitHub Pages
1. Push the repo to GitHub
2. Enable GitHub Pages
3. Set the source to the root folder
4. Play directly from the browser

---

## 🎨 Visual Direction

- Saul Bass / mid-century modern poster influence
- Flat color palettes per mission
- Silhouette characters with minimal detail
- Parallax layers to suggest depth without complex geometry

---

## 🛠️ Planned (Not Included)

- Unity 2.5D rebuild
- Customer character design
- Custom Level Design
- Flat / toon shaders
- Rive or sprite-based animation
- Episodic mission structure framed as dossiers
- Poster-style transitions and cutscenes

## Issues
- Confusing goggle usage and visibility
- Movement Controls linked to reset button
  

---

## 📄 License

This project is generated with ChatGPT and is shared for experimentation and development purposes.
