import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalContext } from '@/App';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { LayoutContext } from '@/components/AppLayout/AppLayout';
import { Pages } from '@/routes';
import { type IGame } from '@/types';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import { Modal } from '@/components/Modal/Modal';
import { AddGameModal } from '@/components/AddGameModal/AddGameModal';
import { LS_GAME_DETAIL_KEY } from '@/components/MainPage/MainPage';

const LS_LIST_KEY = 'dnd_fo_games_list';

const getGamesList = (): IGame[] => {
  const gamesList = localStorage.getItem(LS_LIST_KEY);
  return gamesList !== null ? JSON.parse(gamesList) : [];
};

const setGamesList = (games: IGame[]): void => {
  localStorage.setItem(LS_LIST_KEY, JSON.stringify(games));
};

enum ModalStatus {
  None,
  AddGame,
  ConfirmDeleteGame,
}

export function AppAside(): React.ReactElement {
  const { setCurrentGame, currentGame } = useContext(GlobalContext);
  const { sidebarOpen, onToggleSidebar, isMobile } = useContext(LayoutContext);
  const [games, setGames] = useState<IGame[]>(getGamesList());
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);
  const [modalStatus, setModalStatus] = useState<ModalStatus>(ModalStatus.None);
  const [formInput, setFormInput] = useState<string>('');
  const { id } = useParams();

  useEffect(() => {
    if (id !== undefined && games.length > 0) {
      const game = games.find((game) => game.id === Number(id));
      if (game !== undefined) {
        setCurrentGame(game);
      }
    }
    // ignore dependency warning
  }, []);

  const icon = useMemo(
    () => (isMobile ? <SidebarIcon className="icon" /> : <SidebarWideIcon className="icon" />),
    [isMobile]
  );

  const onCloseModal = (): void => {
    setSelectedGame(null);
    setModalStatus(ModalStatus.None);
    setFormInput('');
  };

  const onConfirmModal = (): void => {
    const newGame: IGame = { id: Math.round(Math.random() * 1_000_000_000), title: formInput };
    const newGames = [...games, newGame].toSorted((a, b) => a.title.localeCompare(b.title));
    setCurrentGame(newGame);
    setGames(newGames);
    setGamesList(newGames);
    onCloseModal();
  };

  const onGameDeleteRequest = (game: IGame): void => {
    setSelectedGame(game);
    setModalStatus(ModalStatus.ConfirmDeleteGame);
  };

  const onGameDelete = (): void => {
    if (selectedGame !== null) {
      const newGames = games.filter((g) => g.id !== selectedGame.id);
      setGames(newGames);
      setGamesList(newGames);
      if (currentGame?.id === selectedGame.id) {
        setCurrentGame(null);
      }
      localStorage.removeItem(LS_GAME_DETAIL_KEY + '__' + selectedGame.id);
    }
    onCloseModal();
  };

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
              <ListItem
                game={game}
                currentGameId={currentGame?.id}
                setCurrentGame={setCurrentGame}
                key={game.id}
                onGameDelete={onGameDeleteRequest}
              />
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className={styles.add_btn}
          onClick={() => {
            setModalStatus(ModalStatus.AddGame);
          }}
        >
          Add new game
        </button>
      </aside>
      <div className={clsx(styles.sidebar_shade, { [styles.open]: sidebarOpen })} onClick={onToggleSidebar} />
      <AddGameModal
        formInput={formInput}
        isModalOpen={modalStatus === ModalStatus.AddGame}
        onCloseModal={onCloseModal}
        onConfirmModal={onConfirmModal}
        setFormInput={setFormInput}
      />
      <Modal
        isOpen={modalStatus === ModalStatus.ConfirmDeleteGame}
        onCloseModal={onCloseModal}
        onConfirmModal={onGameDelete}
      >
        <p>Are you sure you want to delete {selectedGame?.title}?</p>
      </Modal>
    </>
  );
}

interface IListItemProps {
  game: IGame;
  currentGameId: number | undefined;
  setCurrentGame: (game: IGame) => void;
  onGameDelete: (game: IGame) => void;
}

function ListItem({ game, currentGameId, setCurrentGame, onGameDelete }: IListItemProps): React.ReactElement {
  return (
    <li className={styles.list_item}>
      <Link
        className={clsx(styles.list_link, { [styles.active]: game.id === currentGameId })}
        to={Pages.Root.replace(':id?', game.id.toString())}
        onClick={() => {
          setCurrentGame(game);
        }}
      >
        {game.title}
      </Link>
      <button
        className={clsx('btn', styles.delete_btn)}
        onClick={() => {
          onGameDelete(game);
        }}
      >
        <DeleteIcon className="icon" />
      </button>
    </li>
  );
}
