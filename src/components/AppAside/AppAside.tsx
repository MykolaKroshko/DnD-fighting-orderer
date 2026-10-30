import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { AddGameModal } from '@/components/AddGameModal/AddGameModal';
import { LayoutContext } from '@/components/AppLayout/AppLayout';
import { Modal } from '@/components/Modal/Modal';
import { GlobalContext, useCurrentGame } from '@/globalContext';
import { gamePath } from '@/paths';
import { type IGame } from '@/types';
import { getGameTitle } from '@/utils';

enum ModalStatus {
  None,
  AddGame,
  ConfirmDeleteGame,
}

export function AppAside(): React.ReactElement {
  const { games, addGame, removeGame } = useContext(GlobalContext);
  const currentGame = useCurrentGame();
  const navigate = useNavigate();
  const { sidebarOpen, onToggleSidebar, isMobile } = useContext(LayoutContext);
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);
  const [modalStatus, setModalStatus] = useState<ModalStatus>(ModalStatus.None);
  const [formInput, setFormInput] = useState<string>('');

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
    const newGame = addGame(formInput);
    onCloseModal();
    void navigate(gamePath(newGame.id));
  };

  const onGameDeleteRequest = (game: IGame): void => {
    setSelectedGame(game);
    setModalStatus(ModalStatus.ConfirmDeleteGame);
  };

  const onGameDelete = (): void => {
    if (selectedGame !== null) {
      removeGame(selectedGame.id);
      if (currentGame?.id === selectedGame.id) {
        void navigate(gamePath());
      }
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
              <ListItem game={game} currentGameId={currentGame?.id} key={game.id} onGameDelete={onGameDeleteRequest} />
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
        <p>Are you sure you want to delete {getGameTitle(selectedGame?.title ?? '')}?</p>
      </Modal>
    </>
  );
}

interface IListItemProps {
  game: IGame;
  currentGameId: string | undefined;
  onGameDelete: (game: IGame) => void;
}

function ListItem({ game, currentGameId, onGameDelete }: IListItemProps): React.ReactElement {
  return (
    <li className={styles.list_item}>
      <Link className={clsx(styles.list_link, { [styles.active]: game.id === currentGameId })} to={gamePath(game.id)}>
        {getGameTitle(game.title)}
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
