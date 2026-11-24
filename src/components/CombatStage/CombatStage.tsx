import styles from './styles.module.scss';
import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button/Button';
import { EditPlayerModal } from '@/components/EditPlayerModal/EditPlayerModal';
import { HpModal } from '@/components/HpModal/HpModal';
import { Modal } from '@/components/Modal/Modal';
import { PlayersTable } from '@/components/PlayersTable/PlayersTable';
import { GameStatus, type IGameDetails, type IPlayer, PlayerStatus } from '@/types';
import {
  advanceTurn,
  getDetailsKeyByPlayerType,
  getNextTurnBlockReason,
  toggleParticipantPause,
  updatePlayersOrder,
} from '@/utils';

interface ICombatStageProps {
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

enum ModalsStatus {
  None,
  ChangeInitiative,
  ConfirmFinishCombat,
}

export function CombatStage({ details, updateGameDetails }: ICombatStageProps): React.ReactElement {
  const [modalsStatus, setModalsStatus] = React.useState<ModalsStatus>(ModalsStatus.None);
  const [currentPlayer, setCurrentPlayer] = React.useState<IPlayer | null>(null);
  const [hpPlayerId, setHpPlayerId] = React.useState<string | null>(null);
  const nextTurnBlockReason = getNextTurnBlockReason(details);

  function onCloseModal(): void {
    setModalsStatus(ModalsStatus.None);
    setCurrentPlayer(null);
  }

  const onNextPlayer = (): void => {
    if (nextTurnBlockReason !== null) {
      toast.info(nextTurnBlockReason);
      return;
    }

    updateGameDetails(advanceTurn(details));
  };

  const onFinishCombat = (): void => {
    updateGameDetails({
      ...details,
      status: GameStatus.Setup,
      currentPlayerId: undefined,
      enemies: [],
      players: details.players.map((p) => ({ ...p, order: undefined, initiative: null })),
      allies: details.allies.map((p) => ({ ...p, order: undefined, initiative: null })),
      round: 1,
    });
    onCloseModal();
  };

  function onRequestToggleUserPaused(player: IPlayer): void {
    if (player.status === PlayerStatus.Active || typeof player.initiative === 'number') {
      updateGameDetails(toggleParticipantPause(details, player));
    } else {
      setCurrentPlayer(player);
      setModalsStatus(ModalsStatus.ChangeInitiative);
    }
  }

  function onConfirmEditPlayerModal(player: IPlayer): void {
    const typeKey = getDetailsKeyByPlayerType(player.type);

    updateGameDetails(
      updatePlayersOrder({
        ...details,
        [typeKey]: details[typeKey].map((p) => (p.id === player.id ? { ...player, status: PlayerStatus.Active } : p)),
      })
    );
    onCloseModal();
  }

  return (
    <>
      <div className={styles.actions}>
        <Button
          aria-disabled={nextTurnBlockReason !== null}
          title={nextTurnBlockReason ?? undefined}
          onClick={onNextPlayer}
        >
          Next Player
        </Button>
        <Button
          className={styles.change_status}
          onClick={() => {
            setModalsStatus(ModalsStatus.ConfirmFinishCombat);
          }}
        >
          Finish Combat
        </Button>
      </div>
      <PlayersTable
        details={details}
        onOpenHp={(player) => {
          setHpPlayerId(player.id);
        }}
        onRequestToggleUserPaused={onRequestToggleUserPaused}
      />
      <HpModal
        playerId={hpPlayerId}
        details={details}
        onUpdate={updateGameDetails}
        onClose={() => {
          setHpPlayerId(null);
        }}
      />
      <Modal
        isOpen={modalsStatus === ModalsStatus.ConfirmFinishCombat}
        title="Finish combat?"
        confirmLabel="Finish"
        onCloseModal={onCloseModal}
        onConfirmModal={onFinishCombat}
      >
        <p>All enemies will be removed and the initiative of players and allies will be reset.</p>
      </Modal>
      {currentPlayer !== null && (
        <EditPlayerModal
          isOpen={modalsStatus === ModalsStatus.ChangeInitiative}
          currentPlayer={currentPlayer}
          onClose={onCloseModal}
          onConfirm={onConfirmEditPlayerModal}
        />
      )}
    </>
  );
}
