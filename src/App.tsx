import './App.scss';
import { createContext, type ReactElement, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { type Game } from '@/types';

interface IGlobalContext {
  currentGame: Game | null;
  setCurrentGame: (game: Game) => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  currentGame: null,
  setCurrentGame: () => {},
});

export function App(): ReactElement {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const ctxValue = useMemo<IGlobalContext>(
    () => ({
      currentGame,
      setCurrentGame,
    }),
    [currentGame]
  );

  return (
    <GlobalContext.Provider value={ctxValue}>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  );
}
