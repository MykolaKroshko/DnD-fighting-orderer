import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import { AddPlayerModal } from '@/components/AddPlayerModal/AddPlayerModal';
import { EditPlayerModal } from '@/components/EditPlayerModal/EditPlayerModal';
import { Modal } from '@/components/Modal/Modal';
import { PlayersTable } from '@/components/PlayersTable/PlayersTable';
import { GameStatus, type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';

interface ISetupStageProps {
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

export enum ModalsStatus {
  None,
  AddPlayer,
  AddAlly,
  AddEnemy,
  DeletePlayer,
  ChangeInitiative,
}

export function SetupStage({ details, updateGameDetails }: ISetupStageProps): React.ReactElement {
  const [modalsStatus, setModalsStatus] = React.useState<ModalsStatus>(ModalsStatus.None);
  const [currentPlayer, setCurrentPlayer] = React.useState<IPlayer | null>(null);

  function onCloseModal(): void {
    setModalsStatus(ModalsStatus.None);
  }

  function onConfirmModal(data: IPlayer): void {
    const type = data.type === PlayerType.Player ? 'players' : data.type === PlayerType.Ally ? 'allies' : 'enemies';
    onCloseModal();
    updateGameDetails({
      ...details,
      [type]: [...details[type], data].toSorted((a, b) => a.name.localeCompare(b.name)),
    });
  }

  function onDeletePlayer(id: number, type: PlayerType): void {
    const typeKey = type === PlayerType.Player ? 'players' : type === PlayerType.Ally ? 'allies' : 'enemies';
    const players = details[typeKey].filter((player) => player.id !== id);
    updateGameDetails({
      ...details,
      [typeKey]: players,
    });
  }

  function onChangeGameMode(): void {
    if (
      details.players.every((p: IPlayer) => p.status === PlayerStatus.Paused || typeof p.initiative === 'number') &&
      details.allies.every((p: IPlayer) => p.status === PlayerStatus.Paused || typeof p.initiative === 'number') &&
      details.enemies.every((p: IPlayer) => p.status === PlayerStatus.Paused || typeof p.initiative === 'number')
    ) {
      updateGameDetails({
        ...details,
        status: GameStatus.Combat,
      });
    } else {
      alert('All players must have an initiative value or be paused to start a combat.');
    }
  }

  return (
    <>
      <div className={styles.actions}>
        <button
          className="btn"
          onClick={() => {
            setModalsStatus(ModalsStatus.AddPlayer);
          }}
        >
          Add Player
        </button>
        <button
          className="btn"
          onClick={() => {
            setModalsStatus(ModalsStatus.AddAlly);
          }}
        >
          Add Ally
        </button>
        <button
          className="btn"
          onClick={() => {
            setModalsStatus(ModalsStatus.AddEnemy);
          }}
        >
          Add Enemy
        </button>
        <button className={clsx('btn', styles.change_status)} onClick={onChangeGameMode}>
          Start Combat
        </button>
      </div>
      <PlayersTable
        details={details}
        setCurrentPlayer={setCurrentPlayer}
        setModalsStatus={setModalsStatus}
        updateGameDetails={updateGameDetails}
      />
      <AddPlayerModal status={modalsStatus} onCloseModal={onCloseModal} onConfirmModal={onConfirmModal} />
      <Modal
        isOpen={modalsStatus === ModalsStatus.DeletePlayer}
        onCloseModal={() => {
          setModalsStatus(ModalsStatus.None);
          setCurrentPlayer(null);
        }}
        onConfirmModal={() => {
          if (currentPlayer !== null) {
            onDeletePlayer(currentPlayer.id, currentPlayer.type);
            setModalsStatus(ModalsStatus.None);
            setCurrentPlayer(null);
          }
        }}
      >
        <p>Are you sure you want to delete {currentPlayer?.name}?</p>
      </Modal>
      <EditPlayerModal
        currentPlayer={currentPlayer}
        setCurrentPlayer={setCurrentPlayer}
        details={details}
        modalsStatus={modalsStatus}
        setModalsStatus={setModalsStatus}
        updateGameDetails={updateGameDetails}
      />
    </>
  );
}
