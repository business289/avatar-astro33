import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
  DependencyList,
} from 'react';
import { useLocation } from 'react-router-dom';

interface NavContextType {
  historyStack: string[];
  onBackOverride: (() => void) | null;
  registerBackOverride: (fn: (() => void) | null) => void;
}

const NavigationContext = createContext<NavContextType>({
  historyStack: [],
  onBackOverride: null,
  registerBackOverride: () => {},
});

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [onBackOverride, setOnBackOverride] = useState<(() => void) | null>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const current = location.pathname;
    if (prevPathRef.current !== null && prevPathRef.current !== current) {
      setHistoryStack(prev => [...prev, prevPathRef.current!]);
      setOnBackOverride(null);
    }
    prevPathRef.current = current;
  }, [location.pathname]);

  const registerBackOverride = useCallback((fn: (() => void) | null) => {
    // Wrap in arrow to prevent React from treating fn as an updater function
    setOnBackOverride(fn ? () => fn : null);
  }, []);

  return (
    <NavigationContext.Provider value={{ historyStack, onBackOverride, registerBackOverride }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);

// Pages with internal phase machines call this to override the Back button action.
// Pass null to unregister (e.g. when back to root phase and route-level back should apply).
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useBackOverride = (fn: (() => void) | null, deps: DependencyList) => {
  const { registerBackOverride } = useNavigation();
  useEffect(() => {
    registerBackOverride(fn);
    return () => registerBackOverride(null);
    // deps is intentionally spread — callers control when the override updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default NavigationContext;
