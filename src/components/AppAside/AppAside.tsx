import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { LayoutContext } from '@/components/AppLayout/AppLayout';
import { Pages } from '@/routes';
import { type Game } from '@/types';

const LS_LIST_KEY = 'dnd_fo_games_list';

const getGamesList = (): Game[] => {
  const gamesList = localStorage.getItem(LS_LIST_KEY);
  return gamesList !== null ? JSON.parse(gamesList) : [];
};

const updateGamesList = (games: Game[]): void => {
  localStorage.setItem(LS_LIST_KEY, JSON.stringify(games));
};

export function AppAside(): React.ReactElement {
  const { sidebarOpen, onToggleSidebar, isMobile } = useContext(LayoutContext);
  const [games, setGames] = React.useState<Game[]>(getGamesList());

  const icon = useMemo(
    () =>
      isMobile ? <SidebarIcon className={styles.sidebar_icon} /> : <SidebarWideIcon className={styles.sidebar_icon} />,
    [isMobile]
  );

  return (
    <>
      <aside className={clsx(styles.sidebar, { [styles.open]: sidebarOpen })}>
        <div>
          <button type="button" className={styles.sidebar_toggle_btn} onClick={onToggleSidebar}>
            {icon}
          </button>
        </div>
        <nav>
          <ul>
            {games.map((game) => (
              <li key={game.id}>
                <Link to={Pages.Root.replace(':id?', game.id.toString())}>{game.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className={clsx(styles.sidebar_shade, { [styles.open]: sidebarOpen })} onClick={onToggleSidebar} />
    </>
  );
}
