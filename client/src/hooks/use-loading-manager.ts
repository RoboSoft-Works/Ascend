import { useState, useEffect, useCallback } from 'react';

interface LoadingManagerState {
  isLoading: boolean;
  loadingStage: string;
  progress: number;
}

export function useLoadingManager() {
  const [loadingState, setLoadingState] = useState<LoadingManagerState>({
    isLoading: true,
    loadingStage: 'Initializing',
    progress: 0
  });

  const stages = [
    { name: 'Initializing', duration: 500 },
    { name: 'Loading Assets', duration: 800 },
    { name: 'Preparing Game', duration: 600 },
    { name: 'Finalizing', duration: 400 },
  ];

  const startLoading = useCallback(() => {
    setLoadingState({
      isLoading: true,
      loadingStage: 'Initializing',
      progress: 0
    });
  }, []);

  const completeLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingStage: 'Complete',
      progress: 100
    });
  }, []);

  useEffect(() => {
    let currentStage = 0;
    let totalProgress = 0;

    const runStages = async () => {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        
        setLoadingState(prev => ({
          ...prev,
          loadingStage: stage.name,
          progress: totalProgress
        }));

        // Simulate progress within this stage
        const stageProgress = 100 / stages.length;
        const steps = 10;
        const stepDuration = stage.duration / steps;

        for (let step = 0; step < steps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          totalProgress += stageProgress / steps;
          
          setLoadingState(prev => ({
            ...prev,
            progress: Math.min(totalProgress, 100)
          }));
        }
      }

      // Complete loading
      completeLoading();
    };

    runStages();
  }, [completeLoading]);

  return {
    ...loadingState,
    startLoading,
    completeLoading
  };
}
