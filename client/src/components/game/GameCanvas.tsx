import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameEngine, GAME_WIDTH, INITIAL_BLOCK_WIDTH, BLOCK_HEIGHT } from '@/hooks/use-game-engine';
import { GameOverModal } from './GameOverModal';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GameCanvas() {
  const {
    gameState,
    score,
    combo,
    perfectStreak,
    blocks,
    debris,
    isFlashing,
    isShaking,
    movingBlockRef,
    currentWidth,
    startGame,
    drop
  } = useGameEngine();

  // Handle keyboard interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') drop();
        else if (gameState === 'start') startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, drop, startGame]);

  // Generate continuous color cycle
  const getBlockColor = (index: number) => {
    // Cycles smoothly through purples and pinks (240 to 300)
    const hue = 247 + ((index * 8) % 60);
    return `hsl(${hue}, 80%, 65%)`;
  };

  // Calculate camera shift to keep action centered
  // If stack is taller than 12, shift it down
  const cameraShift = blocks.length > 12 ? (blocks.length - 12) * BLOCK_HEIGHT : 0;

  return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center bg-black p-0 sm:p-4 font-sans select-none">
      
      {/* Main Game Container */}
      <div 
        className={`
          relative w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:rounded-3xl 
          bg-game overflow-hidden border-border/50 sm:border 
          shadow-2xl shadow-primary/10 touch-none
          ${isFlashing ? 'animate-flash' : ''}
          ${isShaking ? 'animate-shake' : ''}
          ${blocks.length > 25 ? 'animate-pulse-bg' : ''}
        `}
        onPointerDown={(e) => {
          e.preventDefault(); // Prevent double firing on touch
          if (gameState === 'playing') drop();
        }}
      >
        
        {/* HUD UI */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stack</span>
            <span className="text-2xl font-black text-white">{blocks.length}</span>
            <AnimatePresence>
              {combo >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-sm font-bold text-accent text-glow-gold"
                >
                  {combo}x COMBO!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score</span>
            <span className="text-4xl font-black text-white text-glow tracking-tighter">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Logical Game Area (Centered inside the container) */}
        <div className="absolute inset-0 flex justify-center">
          <div 
            className="relative h-full"
            style={{ width: GAME_WIDTH }}
          >
            {/* The Stacking Area - shifts down as it grows */}
            <div 
              className="absolute inset-x-0 bottom-[20%] transition-transform duration-300 ease-out"
              style={{ transform: `translateY(${cameraShift}px)` }}
            >
              
              {/* Static Blocks */}
              {blocks.map((b, i) => (
                <div
                  key={b.id}
                  className="absolute block-glow rounded-md"
                  style={{
                    bottom: i * BLOCK_HEIGHT,
                    left: b.x,
                    width: b.w,
                    height: BLOCK_HEIGHT,
                    backgroundColor: getBlockColor(i),
                    zIndex: i
                  }}
                >
                  {b.perfect && i > 0 && (
                    <div className="absolute inset-0 border-2 border-white/40 rounded-md mix-blend-overlay pointer-events-none" />
                  )}
                </div>
              ))}

              {/* Moving Block */}
              {gameState === 'playing' && (
                <div
                  ref={movingBlockRef}
                  className="absolute block-glow rounded-md shadow-2xl transition-none will-change-transform"
                  style={{
                    bottom: blocks.length * BLOCK_HEIGHT,
                    height: BLOCK_HEIGHT,
                    backgroundColor: getBlockColor(blocks.length),
                    zIndex: blocks.length + 1,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                  }}
                />
              )}

              {/* Falling Debris */}
              <AnimatePresence>
                {debris.map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ y: -(d.y * BLOCK_HEIGHT), x: d.x, opacity: 1, rotate: 0 }}
                    animate={{ 
                      y: -((d.y - 10) * BLOCK_HEIGHT), 
                      x: d.x + (d.isLeft ? -50 : 50),
                      opacity: 0,
                      rotate: d.isLeft ? -45 : 45
                    }}
                    transition={{ duration: 1, ease: "easeIn" }}
                    className="absolute block-glow rounded-md pointer-events-none"
                    style={{
                      width: d.w,
                      height: BLOCK_HEIGHT,
                      backgroundColor: getBlockColor(d.y),
                      bottom: 0,
                    }}
                  />
                ))}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Start Screen Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6">
            <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow text-center">
              ASCEND
            </h1>
            <p className="text-muted-foreground mb-12 font-medium tracking-wide text-center">
              Precision Stacker
            </p>
            
            <Button size="lg" onClick={startGame} className="w-full max-w-[240px] text-xl h-16 rounded-2xl animate-pulse">
              <Play className="w-6 h-6 mr-2 fill-current" />
              TAP TO START
            </Button>
            
            <p className="mt-6 text-sm text-white/40">Tap anywhere to drop the block</p>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {gameState === 'gameover' && (
          <GameOverModal 
            score={score} 
            perfectStreak={perfectStreak} 
            onRestart={startGame} 
          />
        )}

      </div>
    </div>
  );
}
