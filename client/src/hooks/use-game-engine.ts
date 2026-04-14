import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

export const GAME_WIDTH = 340;
export const INITIAL_BLOCK_WIDTH = 240;
export const BLOCK_HEIGHT = 32;
export const PERFECT_TOLERANCE = 4; // px

export type GameState = 'start' | 'playing' | 'gameover';

export interface Block {
  id: number;
  x: number;
  w: number;
  perfect: boolean;
}

export interface Debris {
  id: number;
  x: number;
  w: number;
  y: number; // stack index height
  isLeft: boolean;
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([{ id: 0, x: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2, w: INITIAL_BLOCK_WIDTH, perfect: true }]);
  const [debris, setDebris] = useState<Debris[]>([]);
  
  // Visual effects state
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Refs for high-performance animation loop (no react re-renders)
  const movingBlockRef = useRef<HTMLDivElement>(null);
  const mX = useRef(0);
  const mW = useRef(INITIAL_BLOCK_WIDTH);
  const mDirection = useRef(1);
  const mSpeed = useRef(2.5); // Slower initial speed for better control
  const animationFrameId = useRef<number>();

  const triggerEffect = (setter: React.Dispatch<React.SetStateAction<boolean>>, duration: number) => {
    setter(true);
    setTimeout(() => setter(false), duration);
  };

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setPerfectStreak(0);
    setBlocks([{ id: 0, x: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2, w: INITIAL_BLOCK_WIDTH, perfect: true }]);
    setDebris([]);
    
    mW.current = INITIAL_BLOCK_WIDTH;
    mX.current = 0;
    mDirection.current = 1;
    mSpeed.current = 2.5; // Reset to optimized initial speed
    
    if (movingBlockRef.current) {
      movingBlockRef.current.style.transform = `translateX(0px)`;
      movingBlockRef.current.style.width = `${INITIAL_BLOCK_WIDTH}px`;
    }
  }, []);

  const triggerPerfectBurst = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FDCB6E', '#A463F5', '#E843FE'],
      disableForReducedMotion: true,
      zIndex: 100
    });
  }, []);

  const drop = useCallback(() => {
    if (gameState !== 'playing') return;

    const topBlock = blocks[blocks.length - 1];
    const currentX = mX.current;
    const currentW = mW.current;

    // Calculate overlap
    const leftEdge = Math.max(topBlock.x, currentX);
    const rightEdge = Math.min(topBlock.x + topBlock.w, currentX + currentW);
    let newW = rightEdge - leftEdge;

    // 1. Completely Missed
    if (newW <= 0) {
      setGameState('gameover');
      setIsShaking(true);
      return;
    }

    let isPerfect = false;
    let finalX = leftEdge;

    // 2. Perfect Placement
    if (Math.abs(topBlock.x - currentX) <= PERFECT_TOLERANCE) {
      isPerfect = true;
      newW = topBlock.w; // Snap to perfect
      finalX = topBlock.x;
      
      const newCombo = combo + 1;
      const comboMultiplier = newCombo >= 3 ? 1.5 : 1;
      setScore(s => s + Math.floor((50 * blocks.length) * comboMultiplier));
      setCombo(newCombo);
      setPerfectStreak(s => s + 1);
      
      triggerEffect(setIsFlashing, 500);
      triggerPerfectBurst();
    } 
    // 3. Imperfect Placement (Trim)
    else {
      setScore(s => s + (10 * blocks.length));
      setCombo(0);
      triggerEffect(setIsShaking, 400);

      // Generate debris
      const isLeftDebris = currentX < topBlock.x;
      const debrisW = currentW - newW;
      const debrisX = isLeftDebris ? currentX : rightEdge;
      
      setDebris(prev => [...prev, {
        id: Date.now(),
        x: debrisX,
        w: debrisW,
        y: blocks.length,
        isLeft: isLeftDebris
      }]);
    }

    // Prepare next state
    setBlocks(prev => [...prev, { id: prev.length, x: finalX, w: newW, perfect: isPerfect }]);
    
    // Update refs for next block
    mW.current = newW;
    // Smoother speed progression
    mSpeed.current = Math.min(8, 2.5 + (blocks.length * 0.12)); // Reduced max speed and smoother progression
    
    // Reverse direction every 8 stacks as per requirements
    if (blocks.length % 8 === 0) {
      mDirection.current *= -1;
    }

    // Move next block to extreme edge to start
    mX.current = mDirection.current === 1 ? 0 : GAME_WIDTH - newW;
    
    if (movingBlockRef.current) {
      movingBlockRef.current.style.width = `${newW}px`;
    }

  }, [gameState, blocks, combo, triggerPerfectBurst]);

  // Main game loop using requestAnimationFrame with optimizations
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    const loop = (time: number) => {
      if (gameState !== 'playing') return;

      // FPS monitoring for performance tuning
      frameCount++;
      const deltaTime = time - lastTime;
      fpsTime += deltaTime;
      
      if (fpsTime >= 1000) {
        // console.log(`FPS: ${frameCount}`); // Uncomment for debugging
        frameCount = 0;
        fpsTime = 0;
      }
      
      lastTime = time;
      
      // Use fixed timestep for consistent physics
      const fixedDelta = 16.67; // 60fps target
      
      mX.current += (mSpeed.current * mDirection.current * fixedDelta / 16.67);

      // Optimized boundary checks
      if (mX.current <= 0) {
        mX.current = 0;
        mDirection.current = 1;
      } else if (mX.current + mW.current >= GAME_WIDTH) {
        mX.current = GAME_WIDTH - mW.current;
        mDirection.current = -1;
      }

      // Apply to DOM directly with will-change optimization
      if (movingBlockRef.current) {
        movingBlockRef.current.style.transform = `translate3d(${mX.current}px, 0, 0)`;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    if (gameState === 'playing') {
      animationFrameId.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState]);

  return {
    gameState,
    score,
    combo,
    perfectStreak,
    blocks,
    debris,
    isFlashing,
    isShaking,
    movingBlockRef,
    currentWidth: mW.current,
    startGame,
    drop
  };
}
