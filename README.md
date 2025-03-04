# Smoke Break Game

## Overview

A web-based maze game where players need to find Ahmed during his smoke break. The game features both single-player and multiplayer modes with different maps and time-based challenges.

## Game Modes

### Single Player Mode

- Navigate through the maze using arrow keys
- Collect hints to find Ahmed
- Avoid other characters
- Limited time and lives
- Score based on remaining time and hints collected

### Multiplayer Mode

- Two-player game: Seeker vs Hider
- Seeker uses arrow keys to find the hider
- Hider (Ahmed) uses WASD to avoid being caught
- Time limit based gameplay

## Technical Structure

### Frontend Files

- `index.html`: Main game mode selection page
- `single.html`: Single player game interface
- `double.html`: Multiplayer game interface

### JavaScript Core

- `tilemap.js`: Handles map rendering and collision detection
- `game.js`: Single player game logic and mechanics
- `multiplayer.js`: Multiplayer game logic
- `character.js`: Character creation and movement
- `hints.js`: Hint system for single player

### Styling

- `style.css`: All game styling and animations

## Game Features

### Maps

## Legend

█ - Wall
░ - Path
P - Player Start
H - Hint Location
A - Ahmed's Location

## Tilemaps

- Morning map: Green theme

![alt text](./assets/images/map3.png)

- Afternoon map: Orange theme

![alt text](./assets/images/map1.png)

- Evening map: Blue theme

![alt text](./assets/images/map2.png)

### Characters

- Player character (black)
- NPC characters (colored dots)
- Ahmed (special colored character in multiplayer)

### Game Mechanics

1. Movement System
   - Grid-based movement
   - Collision detection
   - Smooth animations

2. Scoring System
   - Time-based scoring
   - Hint collection bonus

3. Hint System
   - Random hint spawning
   - Different hint types (location, color, etc.)
   - Score multipliers
