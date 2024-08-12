import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { type FormEvent, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '@/App';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { LayoutContext } from '@/components/AppLayout/AppLayout';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { Pages } from '@/routes';
import { type Game } from '@/types';

const LS_LIST_KEY = 'dnd_fo_games_list';

const getGamesList = (): Game[] => {
  const gamesList = localStorage.getItem(LS_LIST_KEY);
  return gamesList !== null ? JSON.parse(gamesList) : [];
};

const setGamesList = (games: Game[]): void => {
  localStorage.setItem(LS_LIST_KEY, JSON.stringify(games));
};

export function AppAside(): React.ReactElement {
  const { setCurrentGame, currentGame } = useContext(GlobalContext);
  const { sidebarOpen, onToggleSidebar, isMobile } = useContext(LayoutContext);
  const [games, setGames] = React.useState<Game[]>(getGamesList());
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [formInput, setFormInput] = React.useState<string>('');

  const icon = useMemo(
    () => (isMobile ? <SidebarIcon className="icon" /> : <SidebarWideIcon className="icon" />),
    [isMobile]
  );

  return (
    <>
      <aside className={clsx(styles.sidebar, { [styles.open]: sidebarOpen })}>
        <div>
          <button type="button" className={clsx('btn', styles.sidebar_toggle_btn)} onClick={onToggleSidebar}>
            {icon}
          </button>
        </div>
        <nav>
          <ul className={styles.list}>
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  className={clsx(styles.list_item, { [styles.active]: game.id === currentGame?.id })}
                  to={Pages.Root.replace(':id?', game.id.toString())}
                  onClick={() => {
                    setCurrentGame(game);
                  }}
                >
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className={styles.add_btn}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Add new game
        </button>
      </aside>
      <div className={clsx(styles.sidebar_shade, { [styles.open]: sidebarOpen })} onClick={onToggleSidebar} />
      <Modal
        isOpen={isModalOpen}
        title="Add new game"
        onCloseModal={() => {
          setIsModalOpen(false);
          setFormInput('');
        }}
        onConfirmModal={() => {
          const newGame: Game = { id: Math.round(Math.random() * 1_000_000_000), title: formInput };
          const newGames = [...games, newGame].toSorted((a, b) => a.title.localeCompare(b.title));
          setCurrentGame(newGame);
          setGames(newGames);
          setGamesList(newGames);
          setIsModalOpen(false);
          setFormInput('');
        }}
      >
        <form>
          <Input
            name="gameTitle"
            label="New game title"
            value={formInput}
            onInput={(e: FormEvent<HTMLInputElement>) => {
              setFormInput(e.currentTarget.value);
            }}
          />
        </form>
      </Modal>
    </>
  );
}
