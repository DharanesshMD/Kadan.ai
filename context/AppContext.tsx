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
  modelUsed: string | null;
  setModelUsed: (model: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{
      userInput,
      setUserInput,
      results,
      setResults,
      isLoading,
      setIsLoading,
      modelUsed,
      setModelUsed,
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