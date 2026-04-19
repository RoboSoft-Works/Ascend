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
  const mSpeed = useRef(2.0); // Optimized initial speed for smooth performance
  const animationFrameId = useRef<number>();
  const colorCache = useRef(new Map<number, string>());

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
    mSpeed.current = 2.0; // Reset to optimized initial speed
    
    if (movingBlockRef.current) {
      movingBlockRef.current.style.transform = `translateX(0px)`;
      movingBlockRef.current.style.width = `${INITIAL_BLOCK_WIDTH}px`;
    }
  }, []);

  const triggerPerfectBurst = useCallback(() => {
    // Use setTimeout to prevent blocking the game loop
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FDCB6E', '#A463F5', '#E843FE'],
        disableForReducedMotion: true,
        zIndex: 100
      });
    }, 0);
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

      // Generate debris with memory management
      const isLeftDebris = currentX < topBlock.x;
      const debrisW = currentW - newW;
      const debrisX = isLeftDebris ? currentX : rightEdge;
      
      setDebris(prev => {
        const newDebris = [...prev, {
          id: Date.now(),
          x: debrisX,
          w: debrisW,
          y: blocks.length,
          isLeft: isLeftDebris
        }];
        // Keep only last 10 debris to prevent memory issues
        return newDebris.slice(-10);
      });
    }

    // Prepare next state
    setBlocks(prev => [...prev, { id: prev.length, x: finalX, w: newW, perfect: isPerfect }]);
    
    // Update refs for next block
    mW.current = newW;
    // Optimized speed progression for smooth gameplay
    mSpeed.current = Math.min(6, 2.0 + (blocks.length * 0.08)); // Reduced max speed and smoother progression
    
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

  // Optimized game loop with performance monitoring and adaptive FPS
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;
    let adaptiveFPS = 60;
    let frameSkipCounter = 0;

    const loop = (time: number) => {
      if (gameState !== 'playing') return;

      // Adaptive FPS based on performance
      frameCount++;
      const deltaTime = time - lastTime;
      fpsTime += deltaTime;
      
      if (fpsTime >= 1000) {
        adaptiveFPS = frameCount;
        frameCount = 0;
        fpsTime = 0;
        
        // Skip frames if performance drops below 45 FPS
        frameSkipCounter = adaptiveFPS < 45 ? 1 : 0;
      }
      
      lastTime = time;
      
      // Skip frames for performance on slower devices
      if (frameSkipCounter > 0) {
        frameSkipCounter--;
        animationFrameId.current = requestAnimationFrame(loop);
        return;
      }
      
      // Optimized movement calculation with adaptive speed
      const speedMultiplier = adaptiveFPS < 45 ? 0.8 : 1.0;
      const moveAmount = (mSpeed.current * mDirection.current * speedMultiplier);
      mX.current += moveAmount;

      // Optimized boundary checks with early returns
      const maxX = GAME_WIDTH - mW.current;
      if (mX.current <= 0) {
        mX.current = 0;
        mDirection.current = 1;
      } else if (mX.current >= maxX) {
        mX.current = maxX;
        mDirection.current = -1;
      }

      // Optimized DOM updates with transform3d for hardware acceleration
      if (movingBlockRef.current) {
        movingBlockRef.current.style.transform = `translate3d(${mX.current.toFixed(2)}px, 0, 0)`;
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
      // Clean up memory
      colorCache.current?.clear();
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
