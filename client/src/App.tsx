import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoadingManager } from "@/hooks/use-loading-manager";
import "@/styles/responsive.css";

// Pages
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Leaderboard from "@/pages/Leaderboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game" component={Game} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isLoading, completeLoading } = useLoadingManager();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoadingScreen 
          isLoading={isLoading} 
          onLoadingComplete={completeLoading}
        />
        <div className={isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}>
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
