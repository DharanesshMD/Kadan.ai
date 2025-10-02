"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserInput, CalculationResult } from '@/types';

interface AppContextType {
  userInput: UserInput | null;
  setUserInput: (input: UserInput) => void;
  results: CalculationResult | null;
  setResults: (results: CalculationResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider value={{
      userInput,
      setUserInput,
      results,
      setResults,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};