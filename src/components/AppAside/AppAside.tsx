import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { type FormEvent, useContext, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const { id } = useParams();

  useEffect(() => {
    if (id !== undefined && games.length > 0) {
      const game = games.find((game) => game.id === Number(id));
      if (game !== undefined) {
        setCurrentGame(game);
      }
    }
  }, []);

  const icon = useMemo(
    () => (isMobile ? <SidebarIcon className="icon" /> : <SidebarWideIcon className="icon" />),
    [isMobile]
  );

  const onCloseModal = (): void => {
    setIsModalOpen(false);
    setFormInput('');
  };

  const onConfirmModal = (): void => {
    const newGame: Game = { id: Math.round(Math.random() * 1_000_000_000), title: formInput };
    const newGames = [...games, newGame].toSorted((a, b) => a.title.localeCompare(b.title));
    setCurrentGame(newGame);
    setGames(newGames);
    setGamesList(newGames);
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
              <ListItem game={game} currentGameId={currentGame?.id} setCurrentGame={setCurrentGame} key={game.id} />
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
      <AddGameModal
        formInput={formInput}
        isModalOpen={isModalOpen}
        onCloseModal={onCloseModal}
        onConfirmModal={onConfirmModal}
        setFormInput={setFormInput}
      />
    </>
  );
}

interface IListItemProps {
  game: Game;
  currentGameId: number | undefined;
  setCurrentGame: (game: Game) => void;
}

function ListItem({ game, currentGameId, setCurrentGame }: IListItemProps): React.ReactElement {
  return (
    <li>
      <Link
        className={clsx(styles.list_item, { [styles.active]: game.id === currentGameId })}
        to={Pages.Root.replace(':id?', game.id.toString())}
        onClick={() => {
          setCurrentGame(game);
        }}
      >
        {game.title}
      </Link>
    </li>
  );
}

interface IAddGameModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onConfirmModal: () => void;
  formInput: string;
  setFormInput: (value: string) => void;
}

function AddGameModal({
  isModalOpen,
  onConfirmModal,
  onCloseModal,
  formInput,
  setFormInput,
}: IAddGameModalProps): React.ReactElement {
  return (
    <Modal isOpen={isModalOpen} title="Add new game" onCloseModal={onCloseModal} onConfirmModal={onConfirmModal}>
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
  );
}
