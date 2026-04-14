import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Crown, Medal, Flame } from 'lucide-react';
import { useScores } from '@/hooks/use-scores';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Leaderboard() {
  const { data: globalScores, isLoading } = useScores();

  // Load local scores as fallback or complement
  const localScoresString = typeof window !== 'undefined' ? localStorage.getItem('ascend_highscores') : null;
  const localScores = localScoresString ? JSON.parse(localScoresString) : [];

  // Use global if available, else local
  const displayScores = globalScores && globalScores.length > 0 ? globalScores : localScores.map((s: any, i: number) => ({
    id: i,
    playerName: s.playerName || s.title || s.name || 'Anonymous',
    title: s.title || s.playerName || s.name || 'Anonymous',
    subtitle: s.subtitle,
    score: s.score,
    perfectStreak: s.perfectStreak,
    createdAt: s.date || s.createdAt
  }));

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-yellow-400 drop-shadow-md" />;
      case 1: return <Medal className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-300 drop-shadow-md" />;
      case 2: return <Medal className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-amber-600 drop-shadow-md" />;
      default: return <span className="font-bold text-muted-foreground w-4 xs:w-6 text-center text-xs xs:text-sm">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-game py-8 xs:py-10 sm:py-12 px-3 xs:px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl xs:max-w-2xl sm:max-w-2xl mx-auto relative z-10">
        
        <div className="flex items-center justify-between mb-8 xs:mb-10 sm:mb-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12">
              <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
          </Link>
          <h1 className="leaderboard-title font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow text-center">
            LEADERBOARD
          </h1>
          <div className="w-8 xs:w-10 sm:w-12" /> {/* spacer for flex balance */}
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-2xl">
          
          <div className="flex items-center justify-between mb-6 xs:mb-8 pb-3 xs:pb-4 border-b border-white/10 text-xs xs:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-2 xs:gap-4">
              <span className="w-6 xs:w-8 text-center">Rank</span>
              <span>Title</span>
            </div>
            <div className="flex items-center gap-4 xs:gap-8 text-right">
              <span className="hidden xs:block w-16 xs:w-20">Streak</span>
              <span className="w-16 xs:w-24">Score</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 xs:py-20 text-muted-foreground">
              <div className="w-8 h-8 xs:w-12 xs:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 xs:mb-4" />
              <p className="font-medium text-sm xs:text-base">Loading high scores...</p>
            </div>
          ) : displayScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 xs:py-20 text-muted-foreground text-center">
              <Trophy className="w-12 h-12 xs:w-16 xs:h-16 mb-3 xs:mb-4 opacity-50" />
              <p className="text-base xs:text-lg font-bold">No scores yet</p>
              <p className="text-xs xs:text-sm mt-1">Be the first to leave your mark!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 xs:gap-3">
              {displayScores.slice(0, 10).map((score: any, index: number) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center justify-between p-3 xs:p-4 rounded-xl xs:rounded-2xl transition-all
                    ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/5 border border-yellow-500/30' : 'bg-white/5 border border-white/5'}
                  `}
                >
                  <div className="flex items-center gap-4 xs:gap-4 flex-1 min-w-0">
                    <div className="w-6 xs:w-8 flex justify-center flex-shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm xs:text-base lg:text-lg truncate">{score.playerName || score.title || 'UNKNOWN'}</div>
                      <div className="text-[10px] xs:text-xs text-muted-foreground">
                        {score.subtitle || (score.createdAt ? format(new Date(score.createdAt), 'MMM d, yyyy') : 'Recently')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 xs:gap-8 text-right flex-shrink-0">
                    <div className="hidden xs:flex items-center gap-1 text-primary w-16 xs:w-20 justify-end">
                      <Flame className="w-3 h-3 xs:w-4 xs:h-4" />
                      <span className="font-bold text-xs xs:text-sm">{score.perfectStreak}</span>
                    </div>
                    <div className={`font-black w-12 xs:w-16 sm:w-24 text-lg xs:text-xl sm:text-2xl ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                      {score.score.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
