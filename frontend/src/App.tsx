import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import { NavigationProvider } from "./context/NavigationContext";
import PageTransition from "./components/PageTransition";
import Index from "./pages/Index";
import DailyHoroscopes from "./pages/DailyHoroscopes";
import ZodiacSigns from "./pages/ZodiacSigns";
import ZodiacDetail from "./pages/ZodiacDetail";
import CompatibilityChecker from "./pages/CompatibilityChecker";
import BirthChart from "./pages/BirthChart";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PalmReading from "./pages/PalmReading";
import InnerVoice from "./pages/InnerVoice";
import InnerVoiceChat from "./pages/InnerVoiceChat";
import InnerVoiceDashboard from "./pages/InnerVoiceDashboard";
import InnerVoiceJournal from "./pages/InnerVoiceJournal";
import InnerVoiceWisdom from "./pages/InnerVoiceWisdom";
import TarotExperience from "./pages/TarotExperience";
import NotFound from "./pages/NotFound";
import CosmicBackground from "./components/CosmicBackground";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/horoscopes"
          element={
            <PageTransition>
              <DailyHoroscopes />
            </PageTransition>
          }
        />
        <Route
          path="/zodiac"
          element={
            <PageTransition>
              <ZodiacSigns />
            </PageTransition>
          }
        />
        <Route
          path="/zodiac/:sign"
          element={
            <PageTransition>
              <ZodiacDetail />
            </PageTransition>
          }
        />
        <Route
          path="/compatibility"
          element={
            <PageTransition>
              <CompatibilityChecker />
            </PageTransition>
          }
        />
        <Route
          path="/birth-chart"
          element={
            <PageTransition>
              <BirthChart />
            </PageTransition>
          }
        />
        <Route
          path="/blog"
          element={
            <PageTransition>
              <Blog />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/palm-reading"
          element={
            <PageTransition>
              <PalmReading />
            </PageTransition>
          }
        />
        <Route
          path="/inner-voice"
          element={
            <PageTransition>
              <InnerVoice />
            </PageTransition>
          }
        />
        <Route
          path="/inner-voice/chat"
          element={
            <PageTransition>
              <InnerVoiceChat />
            </PageTransition>
          }
        />
        <Route
          path="/inner-voice/dashboard"
          element={
            <PageTransition>
              <InnerVoiceDashboard />
            </PageTransition>
          }
        />
        <Route
          path="/inner-voice/journal"
          element={
            <PageTransition>
              <InnerVoiceJournal />
            </PageTransition>
          }
        />
        <Route
          path="/inner-voice/wisdom"
          element={
            <PageTransition>
              <InnerVoiceWisdom />
            </PageTransition>
          }
        />
        <Route
          path="/tarot"
          element={
            <PageTransition>
              <TarotExperience />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CosmicBackground />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationProvider>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </NavigationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;