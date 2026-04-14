import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Play, Trophy, Zap, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useScoreTitle } from '@/hooks/use-score-titles';

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

  const { currentTitle, nextTitle, progressToNext, isNewTitle } = useScoreTitle(stats.bestScore);

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
        className="flex-1 flex flex-col items-center justify-center px-4 xs:px-6 py-8 xs:py-12 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-4 xs:mb-6 sm:mb-8 lg:mb-10">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="ascend-title font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent text-glow text-center drop-shadow-2xl"
          >
            ASCEND
          </motion.div>
          <motion.p 
            variants={itemVariants}
            className="ascend-subtitle text-center text-muted-foreground font-semibold uppercase mt-2 xs:mt-3"
          >
            Precision Stacker
          </motion.p>
        </motion.div>

        {/* Dynamic Player Title */}
        <motion.div 
          variants={itemVariants}
          className="mb-6 xs:mb-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
            className={`text-center ${isNewTitle ? 'animate-pulse' : ''}`}
          >
            <motion.div
              className={`section-title font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTitle.color} text-center mb-2`}
              whileHover={{ scale: 1.05 }}
            >
              {currentTitle.title}
            </motion.div>
            <motion.p 
              className="text-center text-muted-foreground font-medium text-sm xs:text-base"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {currentTitle.subtitle}
            </motion.p>
            
            {/* Progress Bar to Next Title */}
            {nextTitle && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-4 max-w-xs mx-auto"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to {nextTitle.title}</span>
                  <span>{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground mt-1">
                  {nextTitle.minScore - stats.bestScore} points to go
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 w-full max-w-md xs:max-w-lg mb-8 xs:mb-12"
        >
          {/* Total Games */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{stats.totalGames}</div>
            <div className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-1">Total Times Played</div>
          </motion.div>

          {/* Best Score */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{stats.bestScore.toLocaleString()}</div>
            <div className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-1">Best Score</div>
          </motion.div>

          {/* Best Streak */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center"
          >
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{stats.bestStreak}</div>
            <div className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-1">Best Streak</div>
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md xs:max-w-lg flex flex-col gap-3 xs:gap-4"
        >
          <Link href="/game">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button 
                size="lg" 
                className="w-full text-base xs:text-lg h-12 xs:h-14 rounded-xl xs:rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold shadow-lg shadow-primary/50"
              >
                <Play className="w-5 h-5 xs:w-6 xs:h-6 mr-2 fill-current" />
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
                className="w-full text-base xs:text-lg h-12 xs:h-14 rounded-xl xs:rounded-2xl border-primary/50 hover:bg-primary/10 font-bold"
              >
                <Trophy className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
                LEADERBOARD
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Footer Text */}
        <motion.p 
          variants={itemVariants}
          className="mt-8 xs:mt-12 text-center text-[10px] xs:text-sm text-muted-foreground max-w-xs xs:max-w-sm"
        >
          Stack blocks with precision. Time your drops perfectly. Reach new heights.
        </motion.p>
      </motion.div>

      {/* Keyboard Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] xs:text-xs text-white/40 pb-4 xs:pb-6 px-4 z-10"
      >
        Powered by RSW Games
      </motion.div>
    </div>
  );
}
