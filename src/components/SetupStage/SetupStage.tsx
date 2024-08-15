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
      const allPlayers = [...details.players, ...details.allies, ...details.enemies]
        .toSorted((a, b) => {
          if (a.status === PlayerStatus.Paused && b.status === PlayerStatus.Paused && a.type === b.type) {
            return a.name.localeCompare(b.name);
          }

          if (a.status === PlayerStatus.Paused) {
            return 1;
          }
          if (b.status === PlayerStatus.Paused) {
            return -1;
          }

          if (a.initiative !== b.initiative) {
            return (b.initiative ?? 0) - (a.initiative ?? 0);
          }

          if (a.initiative === b.initiative) {
            if (a.type === PlayerType.Player && b.type !== PlayerType.Player) {
              return -1;
            }

            if (b.type === PlayerType.Player && a.type !== PlayerType.Player) {
              return 1;
            }

            if (typeof a.dex === 'number' && typeof b.dex === 'number') {
              return b.dex - a.dex;
            }
          }

          return 0;
        })
        .map((p, i) => ({ ...p, order: i + 1 }));

      updateGameDetails({
        ...details,
        status: GameStatus.Combat,
        players: allPlayers.filter((p) => p.type === PlayerType.Player),
        allies: allPlayers.filter((p) => p.type === PlayerType.Ally),
        enemies: allPlayers.filter((p) => p.type === PlayerType.Enemy),
        currentPlayerId: allPlayers[0].id,
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
