import { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameEngine, GAME_WIDTH, INITIAL_BLOCK_WIDTH, BLOCK_HEIGHT } from '@/hooks/use-game-engine';
import { useScoreTitle } from '@/hooks/use-score-titles';
import { GameOverModal } from './GameOverModal';
import { Play, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GameCanvas() {
  const [, setLocation] = useLocation();
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

  const { currentTitle, isNewTitle } = useScoreTitle(score);

  // Auto-start game on mount, handle keyboard interaction
  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') drop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, drop]);

  // Memoize color calculation to prevent unnecessary recalculations
  const getBlockColor = useCallback((index: number) => {
    // Cycles smoothly through purples and pinks (240 to 300)
    const hue = 247 + ((index * 8) % 60);
    return `hsl(${hue}, 80%, 65%)`;
  }, []);

  // Memoize camera shift calculation
  const cameraShift = useMemo(() => {
    return blocks.length > 12 ? (blocks.length - 12) * BLOCK_HEIGHT : 0;
  }, [blocks.length]);

  return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center bg-black p-0 sm:p-2 lg:p-4 font-sans select-none overflow-hidden">
      
      {/* Main Game Container */}
      <div 
        className={`
          relative w-full max-w-[380px] xs:max-w-[400px] h-[100dvh] xs:h-[90vh] sm:h-[800px] sm:max-h-[90vh] 
          rounded-none xs:rounded-xl sm:rounded-3xl 
          bg-game overflow-hidden border-border/30 xs:border-border/50 sm:border 
          shadow-lg xs:shadow-xl sm:shadow-2xl shadow-primary/10 touch-none
          ${isFlashing ? 'animate-flash' : ''}
          ${isShaking ? 'animate-shake' : ''}
          ${blocks.length > 25 ? 'animate-pulse-bg' : ''}
        `}
        onPointerDown={(e) => {
          e.preventDefault(); // Prevent double firing on touch
          if (gameState === 'playing') drop();
        }}
      >
        {/* Home Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setLocation('/')}
          className="absolute bottom-4 xs:bottom-6 left-4 xs:left-6 z-40 hover:opacity-80 transition-opacity"
          data-testid="button-home"
        >
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
            <Home className="w-5 h-5 text-white" />
          </Button>
        </motion.button>
        
        {/* HUD UI */}
        <div className="absolute top-0 inset-x-0 p-3 xs:p-4 sm:p-6 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[10px] xs:text-xs font-bold text-muted-foreground uppercase tracking-wider">Stack</span>
            <span className="text-xl xs:text-2xl font-black text-white">{blocks.length}</span>
            <AnimatePresence>
              {combo >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-xs xs:text-sm font-bold text-accent text-glow-gold"
                >
                  {combo}x COMBO!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] xs:text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</span>
            <span className="text-3xl xs:text-4xl font-black text-white text-glow tracking-tighter">
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
                    width: currentWidth,
                    backgroundColor: getBlockColor(blocks.length),
                    zIndex: blocks.length + 1,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                    transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
                    backfaceVisibility: 'hidden' as any,
                    perspective: 1000
                  }}
                />
              )}

              {/* Falling Debris */}
              <AnimatePresence>
                {debris.map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ 
                      y: -(d.y * BLOCK_HEIGHT), 
                      x: d.x, 
                      opacity: 0.8, 
                      rotate: 0,
                      scale: 1
                    }}
                    animate={{ 
                      y: -((d.y - 8) * BLOCK_HEIGHT), 
                      x: d.x + (d.isLeft ? -40 : 40),
                      opacity: 0,
                      rotate: d.isLeft ? -30 : 30,
                      scale: 0.8
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut",
                      type: "tween"
                    }}
                    className="absolute block-glow rounded-md pointer-events-none"
                    style={{
                      width: d.w,
                      height: BLOCK_HEIGHT,
                      backgroundColor: getBlockColor(d.y),
                      bottom: 0,
                      willChange: 'transform'
                    }}
                  />
                ))}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Title Achievement Notification */}
        <AnimatePresence>
          {isNewTitle && score > 0 && gameState === 'playing' && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none z-30"
            >
              <motion.div
                className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                <div className="text-center">
                  <motion.div
                    className={`section-title font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTitle.color}`}
                  >
                    {currentTitle.title}
                  </motion.div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {currentTitle.subtitle}
                  </p>
                </div>
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
