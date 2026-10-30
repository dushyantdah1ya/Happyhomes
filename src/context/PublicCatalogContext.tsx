import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DevelopmentPublic } from '../types/development';

interface PublicCatalogContextValue {
  initialDevelopments?: DevelopmentPublic[];
  currentDevelopment?: DevelopmentPublic | null;
  setCurrentDevelopment?: (dev: DevelopmentPublic | null) => void;
}

const PublicCatalogContext = createContext<PublicCatalogContextValue>({});

export function PublicCatalogProvider({
  children,
  initialDevelopments,
  currentDevelopment: initialCurrentDev,
}: {
  children: ReactNode;
  initialDevelopments?: DevelopmentPublic[];
  currentDevelopment?: DevelopmentPublic | null;
}) {
  const [currentDev, setCurrentDev] = useState<DevelopmentPublic | null>(initialCurrentDev || null);

  useEffect(() => {
    if (initialCurrentDev) {
      setCurrentDev(initialCurrentDev);
    }
  }, [initialCurrentDev]);

  return (
    <PublicCatalogContext.Provider
      value={{
        initialDevelopments,
        currentDevelopment: currentDev,
        setCurrentDevelopment: setCurrentDev,
      }}
    >
      {children}
    </PublicCatalogContext.Provider>
  );
}

export function usePublicCatalog() {
  return useContext(PublicCatalogContext);
}
