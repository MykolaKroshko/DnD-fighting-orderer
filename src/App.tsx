import './App.scss';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { GlobalContext } from '@/globalContext';
import { router } from '@/routes';
import { getGamesList, removeGameDetails, setGamesList } from '@/storage';
import { type IGame } from '@/types';
import { createGame } from '@/utils';

export function App(): ReactElement {
  const [games, setGames] = useState<IGame[]>(getGamesList);

  const addGame = useCallback(
    (title: string): IGame => {
      const newGame = createGame(title);
      const newGames = [...games, newGame].toSorted((a, b) => a.title.localeCompare(b.title));
      setGames(newGames);
      setGamesList(newGames);
      return newGame;
    },
    [games]
  );

  const removeGame = useCallback(
    (id: string): void => {
      const newGames = games.filter((game) => game.id !== id);
      setGames(newGames);
      setGamesList(newGames);
      removeGameDetails(id);
    },
    [games]
  );

  const ctxValue = useMemo(() => ({ games, addGame, removeGame }), [games, addGame, removeGame]);

  return (
    <GlobalContext.Provider value={ctxValue}>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  );
}
