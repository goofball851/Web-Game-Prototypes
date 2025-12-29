# Item Swap Adventure 🧩🎮

<img width="500" height="500" alt="Gemini_Generated_Image_ylgzr6ylgzr6ylgz" src="https://github.com/user-attachments/assets/4caba98e-e408-4c1a-81be-58f3c5d34425" />

**Item Swap Adventure** is a lightweight, browser-based 2D platformer built with **React, TypeScript, and the HTML5 Canvas API**.  
The game focuses on **item swapping, delivery goals, and simple platforming**, all without using a traditional game engine.

This project is designed to be:
- Easy to understand
- Fun to extend
- Perfect as a mini-game, prototype, or web experiment

---

## ✨ Gameplay Overview

- Move through a long, side-scrolling level
- Pick up items scattered across platforms
- Deliver the **correct item** to each goal
- You can only carry **one item at a time**
- Picking up a new item drops the current one
- Complete all goals to win

---

## 🎮 Controls

| Key | Action |
|----|-------|
| **A / D** | Move left / right |
| **Space** | Jump |
| **E** | Pick up, drop, or deliver item |

---

## 🧠 Core Mechanics

### Item System
- Items are randomly generated
- Each item has:
  - Type
  - Color
  - Emoji icon
  - Point value
- Items pulse visually to draw attention

### Goals
- Each goal requires a **specific item type**
- Delivering the correct item:
  - Awards points
  - Marks the goal as complete
  - Spawns a new random item
- Delivering the wrong item shows feedback

### Player Rules
- Only **one item can be held at a time**
- Picking up a new item automatically drops the old one
- Items float above the player when held

---

## 🧱 Technical Details

- Built with **React Functional Components**
- Written in **TypeScript**
- Uses:
  - `useRef` for mutable game state
  - `useEffect` for lifecycle control
  - `requestAnimationFrame` for the game loop
- Rendering handled entirely via **Canvas 2D API**
- No external game engine required

---

## 🎨 Visual Style

- Flat, arcade-style graphics
- Simple shapes and bright colors
- Emoji-based item icons
- Floating prompts and UI hints
- Side-scrolling camera that follows the player

---

## 🧪 Game States

- **Menu** – Start screen with instructions
- **Playing** – Active gameplay
- **Win** – Victory screen after all goals are completed

---

## 📦 Project Structure

