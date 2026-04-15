import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ isLoading, onLoadingComplete }: LoadingScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger content animation after a short delay
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Call completion callback when loading finishes
    if (!isLoading && onLoadingComplete) {
      const timer = setTimeout(onLoadingComplete, 500); // Allow exit animation
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ margin: 0, padding: 0 }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[100px] rounded-full"
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-accent/10 blur-[80px] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: showContent ? 1 : 0.8, 
                opacity: showContent ? 1 : 0 
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                bounce: 0.5
              }}
              className="mb-8"
            >
              <motion.h1
                className="text-6xl xs:text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent text-glow text-center drop-shadow-2xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                ASCEND
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: showContent ? 0 : 20, 
                  opacity: showContent ? 1 : 0 
                }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center text-muted-foreground font-semibold tracking-widest uppercase text-sm sm:text-base"
              >
                Precision Stacker
              </motion.p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: showContent ? 0 : 20, 
                opacity: showContent ? 1 : 0 
              }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* Animated Blocks */}
              <div className="flex gap-2 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-t from-primary to-secondary rounded"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Loading Text */}
              <motion.div
                className="text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Loading Experience
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Preparing your ascent...
                </p>
              </motion.div>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: showContent ? "200px" : 0, 
                opacity: showContent ? 1 : 0 
              }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-8 mb-8"
            >
              <div className="w-48 xs:w-52 h-1 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Version/Developer Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-center text-[10px] xs:text-xs text-white/40 pb-4 xs:pb-6 px-4 z-10"
            >
              <p className="text-xs text-white/40">
                Powered by RSW Games
              </p>

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
