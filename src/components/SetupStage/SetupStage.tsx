import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import { AddPlayerModal } from '@/components/AddPlayerModal/AddPlayerModal';
import { EditPlayerModal } from '@/components/EditPlayerModal/EditPlayerModal';
import { Modal } from '@/components/Modal/Modal';
import { PlayerRow } from '@/components/PlayerRow/PlayerRow';
import { type IGameDetails, type IPlayer, PlayerType } from '@/types';

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

  function onRequestDeletePlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.DeletePlayer);
  }

  function onRequestEditPlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.ChangeInitiative);
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
        <button className={clsx('btn', styles.change_status)}>Start Combat</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Initiative</th>
            <th>Dex</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {details.players.map((player) => (
            <PlayerRow key={player.id} player={player} onDelete={onRequestDeletePlayer} onEdit={onRequestEditPlayer} />
          ))}
          {details.allies.map((player) => (
            <PlayerRow key={player.id} player={player} onDelete={onRequestDeletePlayer} onEdit={onRequestEditPlayer} />
          ))}
          {details.enemies.map((player) => (
            <PlayerRow key={player.id} player={player} onDelete={onRequestDeletePlayer} onEdit={onRequestEditPlayer} />
          ))}
        </tbody>
      </table>
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
