
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RunFlavor, VisualStyle } from '../types';

const lerpAngle = (start: number, end: number, t: number): number => {
  let difference = end - start;
  while (difference < -Math.PI) difference += Math.PI * 2;
  while (difference > Math.PI) difference -= Math.PI * 2;
  return start + difference * t;
};

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

interface Projectile {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  life: number;
  color: number;
  targetPos: THREE.Vector3;
  targetMesh: THREE.Mesh | null;
  hasHit: boolean;
}

interface GameViewProps {
  flavor: RunFlavor;
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onDestructionUpdate?: (count: number) => void;
  onComboUpdate?: (combo: number) => void;
}

const COLOR_PHASES = [
  { main: 0x00ffff, bg: 0x112244, grid: 0x00ffff, player: 0xe0ffff },
  { main: 0xff00ff, bg: 0x441133, grid: 0xff00ff, player: 0xffe0ff },
  { main: 0x00ff00, bg: 0x113311, grid: 0x00ff00, player: 0xe0ffe0 },
  { main: 0xffff00, bg: 0x443311, grid: 0xffff00, player: 0xffffe0 },
  { main: 0xffffff, bg: 0x333333, grid: 0xffffff, player: 0xffffff },
];

const DESTRUCTION_GOAL = 10;
const COMBO_TIMEOUT = 1.5;

const GameView: React.FC<GameViewProps> = ({ flavor, onGameOver, onVictory, onScoreUpdate, onDestructionUpdate, onComboUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    player: THREE.Group;
    playerBody: THREE.Mesh;
    obstacles: THREE.Mesh[];
    particles: Particle[];
    projectiles: Projectile[];
    grid: THREE.GridHelper;
    score: number;
    distance: number;
    speed: number;
    isAlive: boolean;
    gun: THREE.Group;
    muzzleFlash: THREE.PointLight;
    laserBeam: THREE.Mesh;
    currentTarget: THREE.Mesh | null;
    keys: Set<string>;
    cameraShake: number;
    fireKick: number;
    destructionCount: number;
    phaseIndex: number;
    combo: number;
    comboTimer: number;
  } | null>(null);

  const updatePhaseVisuals = () => {
    const g = gameRef.current;
    if (!g) return;
    const phase = COLOR_PHASES[g.phaseIndex];
    
    g.scene.background = new THREE.Color(phase.bg);
    if (g.scene.fog instanceof THREE.FogExp2) {
      g.scene.fog.color.set(phase.bg);
    }

    const playerMat = g.playerBody.material as THREE.MeshStandardMaterial;
    playerMat.color.set(phase.player);
    playerMat.emissive.set(phase.player);
    playerMat.emissiveIntensity = 0.8;

    g.scene.remove(g.grid);
    g.grid = new THREE.GridHelper(800, 100, phase.main, phase.grid);
    g.grid.material.transparent = true;
    g.grid.material.opacity = 0.4;
    g.scene.add(g.grid);

    (g.laserBeam.material as THREE.MeshBasicMaterial).color.set(phase.main);
    g.muzzleFlash.color.set(phase.main);

    containerRef.current?.classList.add('phase-shift-active');
    setTimeout(() => containerRef.current?.classList.remove('phase-shift-active'), 400);
  };

  const triggerDestruction = (target: THREE.Mesh, targetPos: THREE.Vector3) => {
    const g = gameRef.current;
    if (!g) return;
    const phase = COLOR_PHASES[g.phaseIndex];

    // Score and Combo logic moved here (to when it hits)
    g.combo += 1;
    g.comboTimer = COMBO_TIMEOUT;
    onComboUpdate?.(g.combo);

    g.score += Math.floor(150 * (1 + (g.combo * 0.2)));
    g.destructionCount += 1;
    onScoreUpdate(g.score);
    if (onDestructionUpdate) onDestructionUpdate(g.destructionCount);
    
    if (g.destructionCount % DESTRUCTION_GOAL === 0) {
      g.phaseIndex = (g.phaseIndex + 1) % COLOR_PHASES.length;
      updatePhaseVisuals();
      g.speed += 0.08;
    }

    // Shard Explosion
    const shardMat = new THREE.MeshStandardMaterial({ 
      color: phase.main, 
      emissive: phase.main, 
      emissiveIntensity: 20 
    });
    for (let i = 0; i < 20; i++) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), shardMat);
      shard.position.copy(targetPos);
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1.8, 
        (Math.random() - 0.5) * 1.8, 
        (Math.random() - 0.5) * 1.8
      );
      g.scene.add(shard);
      g.particles.push({ mesh: shard, velocity, life: 1.0 });
    }

    target.scale.set(0, 0, 0);
  };

  useEffect(() => {
    (window as any).triggerHappyFire = () => {
      if (!gameRef.current || !gameRef.current.isAlive) return;
      
      const g = gameRef.current;
      const phase = COLOR_PHASES[g.phaseIndex];
      
      g.muzzleFlash.intensity = 80;
      g.laserBeam.visible = true;
      g.cameraShake = 0.8;
      g.fireKick = 0.6;

      const spawnPos = new THREE.Vector3();
      g.gun.getWorldPosition(spawnPos);

      const targetPos = new THREE.Vector3();
      const target = g.currentTarget;

      if (target && target.scale.x > 0.1) {
        target.getWorldPosition(targetPos);
      } else {
        targetPos.copy(spawnPos).add(new THREE.Vector3(0, 0, -100).applyQuaternion(g.gun.quaternion));
      }

      // Laser beam is now a fixed-size muzzle bolt (doesn't stretch to target)
      g.laserBeam.lookAt(targetPos);
      g.laserBeam.scale.z = 4.0; // Fixed size tracer burst

      // Projectile
      const projectileGroup = new THREE.Group();
      const tailGeo = new THREE.CylinderGeometry(0.01, 0.25, 6, 8); 
      const tailMat = new THREE.MeshBasicMaterial({ color: phase.main, transparent: true, opacity: 0.8 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.rotateX(Math.PI / 2);
      tail.position.z = 3; 
      projectileGroup.add(tail);

      const boltGlow = new THREE.PointLight(phase.main, 30, 15);
      projectileGroup.add(boltGlow);
      
      projectileGroup.position.copy(spawnPos);
      const direction = targetPos.clone().sub(spawnPos).normalize();
      projectileGroup.lookAt(targetPos);
      
      g.scene.add(projectileGroup);
      g.projectiles.push({
        mesh: projectileGroup,
        velocity: direction.multiplyScalar(4.8), 
        life: 1.0,
        color: phase.main,
        targetPos: targetPos.clone(),
        targetMesh: target,
        hasHit: false
      });

      setTimeout(() => {
        if (gameRef.current) {
          gameRef.current.muzzleFlash.intensity = 0;
          gameRef.current.laserBeam.visible = false;
        }
      }, 90);
    };

    (window as any).triggerHappyMove = (dir: 'left' | 'right' | 'stop') => {
      const g = gameRef.current;
      if (!g) return;
      if (dir === 'left') g.keys.add('a');
      else if (dir === 'right') g.keys.add('d');
      else { g.keys.delete('a'); g.keys.delete('d'); }
    };

    return () => {
      delete (window as any).triggerHappyFire;
      delete (window as any).triggerHappyMove;
    };
  }, [onScoreUpdate, onDestructionUpdate, onComboUpdate]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const initialPhase = COLOR_PHASES[0];
    scene.background = new THREE.Color(initialPhase.bg);
    scene.fog = new THREE.FogExp2(initialPhase.bg, 0.012);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const player = new THREE.Group();
    const playerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.3, 0.7), 
      new THREE.MeshStandardMaterial({ color: initialPhase.player, emissive: initialPhase.player, emissiveIntensity: 1.0 })
    );
    player.add(playerBody);
    
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.2, 0.2), 
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 15 })
    );
    visor.position.set(0, 1.0, 0.35);
    player.add(visor);

    const gunPivot = new THREE.Group();
    gunPivot.position.set(0.4, 0.8, 0.2);
    const gunMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 1.4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    gunMesh.position.z = 0.7;
    gunPivot.add(gunMesh);
    
    const laserBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1, 8), 
      new THREE.MeshBasicMaterial({ color: initialPhase.main, transparent: true, opacity: 0.9 })
    );
    laserBeam.rotateX(Math.PI / 2);
    laserBeam.translateY(0.5);
    laserBeam.visible = false;
    gunMesh.add(laserBeam);

    const muzzleFlash = new THREE.PointLight(initialPhase.main, 0, 20);
    muzzleFlash.position.z = 0.7;
    gunMesh.add(muzzleFlash);

    player.add(gunPivot);
    scene.add(player);

    const grid = new THREE.GridHelper(800, 100, initialPhase.main, initialPhase.grid);
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    scene.add(grid);

    const obstacles: THREE.Mesh[] = [];
    const obGeo = new THREE.BoxGeometry(2.5, 5.0, 2.5);
    for (let i = 0; i < 30; i++) {
      const ob = new THREE.Mesh(obGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }));
      ob.position.set((Math.random() - 0.5) * 18, 2.5, -i * 35 - 60);
      scene.add(ob);
      obstacles.push(ob);
    }

    gameRef.current = {
      scene, camera, renderer, player, playerBody, obstacles, particles: [], projectiles: [], grid,
      score: 0, distance: 0, speed: 1.0, isAlive: true, gun: gunPivot, muzzleFlash, laserBeam, currentTarget: null,
      keys: new Set(), cameraShake: 0, fireKick: 0, destructionCount: 0, phaseIndex: 0,
      combo: 0, comboTimer: 0
    };

    let lastTime = performance.now();
    let frameId: number;
    const animate = () => {
      if (!gameRef.current?.isAlive) return;
      const g = gameRef.current;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const time = now * 0.001;

      if (g.combo > 0) {
        g.comboTimer -= dt;
        if (g.comboTimer <= 0) {
          g.combo = 0;
          onComboUpdate?.(0);
        }
      }

      const moveInput = (g.keys.has('a') ? -1 : 0) + (g.keys.has('d') ? 1 : 0);
      g.player.position.x += moveInput * 0.45;
      g.player.position.x = THREE.MathUtils.clamp(g.player.position.x, -9, 9);
      
      const targetZRot = -moveInput * 0.18;
      g.camera.rotation.z = THREE.MathUtils.lerp(g.camera.rotation.z, targetZRot, 0.12);

      g.distance += g.speed;
      g.player.position.z -= g.speed;
      g.grid.position.z = g.player.position.z % 8;

      const sx = (Math.random() - 0.5) * g.cameraShake;
      const sy = (Math.random() - 0.5) * g.cameraShake;
      g.camera.position.set(g.player.position.x * 0.7 + sx, g.player.position.y + 3.0 + sy, g.player.position.z + 7.0 + g.fireKick);
      g.camera.lookAt(g.player.position.x, 2.2, g.player.position.z - 35);
      g.cameraShake *= 0.82;
      g.fireKick *= 0.75;

      // Projectile Update with Arrival Collision
      for (let i = g.projectiles.length - 1; i >= 0; i--) {
        const p = g.projectiles[i];
        p.mesh.position.add(p.velocity);
        
        // Trail segments
        const trailPartGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const trailPartMat = new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.8 });
        const trailPart = new THREE.Mesh(trailPartGeo, trailPartMat);
        trailPart.position.copy(p.mesh.position);
        g.scene.add(trailPart);
        g.particles.push({ mesh: trailPart, velocity: new THREE.Vector3(0,0,0), life: 0.4 });

        // Check for impact arrival
        const distToTarget = p.mesh.position.distanceTo(p.targetPos);
        if (distToTarget < 5.0 && !p.hasHit) {
            p.hasHit = true;
            if (p.targetMesh && p.targetMesh.scale.x > 0.1) {
                triggerDestruction(p.targetMesh, p.targetPos);
            }
        }

        p.life -= 0.03;
        if (p.life <= 0 || (p.hasHit && distToTarget < 2.0)) { 
          g.scene.remove(p.mesh); 
          g.projectiles.splice(i, 1); 
        }
      }

      // Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.mesh.position.add(p.velocity);
        p.life -= 0.045;
        p.mesh.scale.setScalar(p.life);
        if (p.mesh.material instanceof THREE.Material) {
          p.mesh.material.opacity = p.life;
        }
        if (p.life <= 0) { 
          g.scene.remove(p.mesh); 
          g.particles.splice(i, 1); 
        }
      }

      let closest: THREE.Mesh | null = null;
      let minDist = 100;
      const phaseColor = COLOR_PHASES[g.phaseIndex].main;

      g.obstacles.forEach(ob => {
        const mat = ob.material as THREE.MeshStandardMaterial;
        const dz = g.player.position.z - ob.position.z;
        
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;

        if (dz > -2.2 && dz < 2.2 && Math.abs(ob.position.x - g.player.position.x) < 2.0 && ob.scale.x > 0.1) {
          g.isAlive = false;
          onGameOver(g.score + Math.floor(g.distance));
        }

        if (dz > 4.0 && dz < minDist && ob.scale.x > 0.1) {
          closest = ob;
          minDist = dz;
        }

        if (ob.position.z > g.player.position.z + 40) {
          ob.position.z = g.player.position.z - 600 - Math.random() * 100;
          ob.position.x = (Math.random() - 0.5) * 20;
          ob.scale.set(1, 1, 1);
        }
      });

      g.currentTarget = closest;
      if (closest) {
        g.gun.lookAt(closest.position);
        const targetMat = closest.material as THREE.MeshStandardMaterial;
        targetMat.emissive.set(phaseColor);
        targetMat.emissiveIntensity = 8.0 + Math.sin(time * 30) * 6.0;
      } else {
        g.gun.lookAt(g.player.position.x, 1.5, g.player.position.z - 50);
      }

      const lookBase = closest ? closest.position : new THREE.Vector3(g.player.position.x, 1, g.player.position.z - 50);
      const targetBodyRotY = Math.atan2(lookBase.x - g.player.position.x, lookBase.z - g.player.position.z);
      g.player.rotation.y = lerpAngle(g.player.rotation.y, targetBodyRotY, 0.25);

      if (g.destructionCount >= 100) {
        g.isAlive = false;
        onVictory(g.score + Math.floor(g.distance));
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') gameRef.current?.keys.add('a');
      if (e.key === 'd' || e.key === 'ArrowRight') gameRef.current?.keys.add('d');
      if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') (window as any).triggerHappyFire?.();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') gameRef.current?.keys.delete('a');
      if (e.key === 'd' || e.key === 'ArrowRight') gameRef.current?.keys.delete('d');
    };
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      (window as any).triggerHappyFire?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [flavor, onGameOver, onVictory]);

  return <div ref={containerRef} className="w-full h-full overflow-hidden chromatic-shift" />;
};

export default GameView;
