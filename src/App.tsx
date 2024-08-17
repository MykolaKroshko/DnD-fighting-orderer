import './App.scss';
import { createContext, type ReactElement, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { type IGame } from '@/types';

interface IGlobalContext {
  currentGame: IGame | null;
  setCurrentGame: (game: IGame | null) => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  currentGame: null,
  setCurrentGame: () => {},
});

export function App(): ReactElement {
  const [currentGame, setCurrentGame] = useState<IGame | null>(null);

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
