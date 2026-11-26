import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { type IGame } from '@/types';

interface IGlobalContext {
  games: IGame[];
  addGame: (title: string) => IGame;
  removeGame: (id: string) => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  games: [],
  addGame: (title) => ({ id: '', title }),
  removeGame: () => {},
});

/** The game opened by the URL `:id`, or `null` when there is no id or it isn't in the games list. */
export function useCurrentGame(): IGame | null {
  const { games } = useContext(GlobalContext);
  const { id } = useParams();

  return games.find((game) => game.id === id) ?? null;
}
