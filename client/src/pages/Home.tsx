import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Play, Trophy, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Stats {
  totalGames: number;
  bestScore: number;
  bestStreak: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    bestScore: 0,
    bestStreak: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem('ascend_highscores');
    if (saved) {
      try {
        const scores = JSON.parse(saved);
        const totalGames = localStorage.getItem('ascend_total_games') ? parseInt(localStorage.getItem('ascend_total_games')!) : scores.length;
        const bestScore = scores.length > 0 ? scores[0].score : 0;
        const bestStreak = Math.max(...scores.map((s: any) => s.perfectStreak || 0), 0);
        
        setStats({
          totalGames,
          bestScore,
          bestStreak
        });
      } catch (e) {}
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-game overflow-hidden relative font-sans flex flex-col">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-accent/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />

      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent text-glow text-center drop-shadow-2xl"
          >
            ASCEND
          </motion.div>
          <motion.p 
            variants={itemVariants}
            className="text-center text-muted-foreground font-semibold tracking-widest mt-2 uppercase text-sm"
          >
            Precision Stacker
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md mb-12"
        >
          {/* Total Games */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <Zap className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalGames}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Games</div>
          </motion.div>

          {/* Best Score */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.bestScore.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Best Score</div>
          </motion.div>

          {/* Best Streak */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <Target className="w-5 h-5 text-accent mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.bestStreak}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Best Streak</div>
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <Link href="/game">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button 
                size="lg" 
                className="w-full text-lg h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold shadow-lg shadow-primary/50"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                PLAY NOW
              </Button>
            </motion.div>
          </Link>

          <Link href="/leaderboard">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg h-14 rounded-2xl border-primary/50 hover:bg-primary/10 font-bold"
              >
                <Trophy className="w-6 h-6 mr-2" />
                LEADERBOARD
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Footer Text */}
        <motion.p 
          variants={itemVariants}
          className="mt-12 text-center text-xs sm:text-sm text-muted-foreground max-w-sm"
        >
          Stack blocks with precision. Time your drops perfectly. Reach new heights.
        </motion.p>
      </motion.div>

      {/* Keyboard Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-white/40 pb-6 px-4 z-10"
      >
        Press Space or tap to play
      </motion.div>
    </div>
  );
}
