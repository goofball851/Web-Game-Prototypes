# 🧩🎮 Emoji Quest: Sketchbook Edition 

<img width="500" height="500" alt="Gemini_Generated_Image_ylgzr6ylgzr6ylgz" src="https://github.com/user-attachments/assets/4caba98e-e408-4c1a-81be-58f3c5d34425" />

A charming, hand-drawn 2D side-scrolling platformer built with React, TypeScript, and the HTML5 Canvas API. Navigate a living sketchbook, collect magical items, and deliver them to their rightful places.

## 🌟 Features

- **Unique Sketchbook Aesthetic**: The entire game is rendered on a parchment-style background with custom "rough line" algorithms that simulate real hand-drawn sketches.
- **"Boiling" Animation**: Lines subtly shift and vibrate during gameplay (a technique known as "line boil") to give the sketchbook a living, animated feel.
- **Parallax Background**: Hand-drawn clouds float with subtle movement and parallax scrolling, providing depth to the 2D world.
- **Fluid Platforming**: Tight controls with gravity, friction, and "squash and stretch" animations for the player character.
- **Item Management**: Find, pick up, and swap various emoji-themed items (Keys, Potions, Gems, etc.) to complete specific goals scattered across the level.
- **Dynamic Camera**: A smooth camera system that follows the player across a large, scrolling world.

## 🎮 Controls

| Key | Action |
|-----|--------|
| **W / Space / Up** | Jump |
| **A / Left** | Move Left |
| **D / Right** | Move Right |
| **E** | Interact (Pick up / Drop / Deliver) |

## 🕹️ How to Play

1. **Explore**: Navigate the platforms to find floating emoji items.
2. **Collect**: Stand near an item and press **E** to pick it up. You can carry one item at a time.
3. **Match**: Locate the sketchy squares (goals) that display the same emoji as the item you are holding.
4. **Deliver**: Stand inside the goal and press **E** to deliver the item and earn points.
5. **Win**: Deliver all required items to complete the "sketch" and win the game!

## 🛠️ Technical Details

- **React & TypeScript**: Powers the game state, UI overlays, and component structure.
- **Canvas API**: Used for the entire game world rendering.
- **Custom Sketch Engine**: Implements a `drawRoughLine` function that uses sine-wave offsets and segments to create a "wobbly" hand-drawn look for all geometric shapes.
- **Tailwind CSS**: Handles the layout and styling for the game's outer shell and menus.
- **Responsive Logic**: Includes window-resize handling and camera clamping for a smooth widescreen experience.

## 📂 Project Structure

- `App.tsx`: Main game loop, rendering logic, and input handling.
- `constants.ts`: World dimensions, physics values, and level layout definitions.
- `types.ts`: TypeScript interfaces for game entities (Player, Item, Goal, Platform).
- `index.html`: Main entry point with font imports and Tailwind setup.

---
*Created with passion for the art of the sketchbook and Google Ai Studio*
