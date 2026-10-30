import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import { toast } from 'react-toastify';
import { AddPlayerModal } from '@/components/AddPlayerModal/AddPlayerModal';
import { EditPlayerModal } from '@/components/EditPlayerModal/EditPlayerModal';
import { Modal } from '@/components/Modal/Modal';
import { PlayersTable } from '@/components/PlayersTable/PlayersTable';
import { type IGameDetails, type IPlayer, PlayerType } from '@/types';
import {
  createPlayer,
  getDetailsKeyByPlayerType,
  getPlayerName,
  getStartCombatBlockReason,
  toggleParticipantPause,
  updatePlayersOrder,
} from '@/utils';

interface ISetupStageProps {
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

enum ModalsStatus {
  None,
  AddPlayer,
  AddAlly,
  AddEnemy,
  DeletePlayer,
  ChangeInitiative,
}

const ADD_MODAL_PLAYER_TYPE: Partial<Record<ModalsStatus, PlayerType>> = {
  [ModalsStatus.AddPlayer]: PlayerType.Player,
  [ModalsStatus.AddAlly]: PlayerType.Ally,
  [ModalsStatus.AddEnemy]: PlayerType.Enemy,
};

export function SetupStage({ details, updateGameDetails }: ISetupStageProps): React.ReactElement {
  const [modalsStatus, setModalsStatus] = React.useState<ModalsStatus>(ModalsStatus.None);
  const [currentPlayer, setCurrentPlayer] = React.useState<IPlayer | null>(null);

  function onCloseModal(): void {
    setModalsStatus(ModalsStatus.None);
    setCurrentPlayer(null);
  }

  function onConfirmModal(data: Omit<IPlayer, 'id'>): void {
    const type = getDetailsKeyByPlayerType(data.type);
    onCloseModal();
    updateGameDetails({
      ...details,
      [type]: [...details[type], createPlayer(data)].toSorted((a, b) => a.name.localeCompare(b.name)),
    });
  }

  function onDeletePlayer(id: string, type: PlayerType): void {
    const typeKey = getDetailsKeyByPlayerType(type);
    const players = details[typeKey].filter((player) => player.id !== id);
    updateGameDetails({
      ...details,
      [typeKey]: players,
    });
  }

  const startCombatBlockReason = getStartCombatBlockReason(details);

  function onChangeGameMode(): void {
    if (startCombatBlockReason !== null) {
      toast.info(startCombatBlockReason);
      return;
    }

    updateGameDetails(updatePlayersOrder(details));
  }

  function onRequestToggleUserPaused(player: IPlayer): void {
    updateGameDetails(toggleParticipantPause(details, player));
  }

  function onConfirmEditPlayerModal(player: IPlayer): void {
    const typeKey = getDetailsKeyByPlayerType(player.type);

    updateGameDetails({
      ...details,
      [typeKey]: details[typeKey].map((p) => (p.id === player.id ? { ...player } : p)),
    });
    onCloseModal();
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
        <button
          className={clsx('btn', styles.change_status)}
          aria-disabled={startCombatBlockReason !== null}
          title={startCombatBlockReason ?? undefined}
          onClick={onChangeGameMode}
        >
          Start Combat
        </button>
      </div>
      <PlayersTable
        details={details}
        onEdit={(player) => {
          setCurrentPlayer(player);
          setModalsStatus(ModalsStatus.ChangeInitiative);
        }}
        onDelete={(player) => {
          setCurrentPlayer(player);
          setModalsStatus(ModalsStatus.DeletePlayer);
        }}
        onRequestToggleUserPaused={onRequestToggleUserPaused}
      />
      <AddPlayerModal
        playerType={ADD_MODAL_PLAYER_TYPE[modalsStatus] ?? null}
        onCloseModal={onCloseModal}
        onConfirmModal={onConfirmModal}
      />
      <Modal
        isOpen={modalsStatus === ModalsStatus.DeletePlayer}
        onCloseModal={onCloseModal}
        onConfirmModal={() => {
          if (currentPlayer !== null) {
            onDeletePlayer(currentPlayer.id, currentPlayer.type);
            onCloseModal();
          }
        }}
      >
        <p>Are you sure you want to delete {getPlayerName(currentPlayer?.name ?? '')}?</p>
      </Modal>
      {currentPlayer !== null && (
        <EditPlayerModal
          currentPlayer={currentPlayer}
          isOpen={modalsStatus === ModalsStatus.ChangeInitiative}
          onClose={onCloseModal}
          onConfirm={onConfirmEditPlayerModal}
        />
      )}
    </>
  );
}
