import clsx from 'clsx';
import React from 'react';
import { EditPlayerModal } from '@/components/EditPlayerModal/EditPlayerModal';
import { PlayersTable } from '@/components/PlayersTable/PlayersTable';
import styles from '@/components/SetupStage/styles.module.scss';
import { GameStatus, type IGameDetails, type IPlayer, PlayerStatus } from '@/types';
import { getDetailsKeyByPlayerType, updatePlayersOrder } from '@/utils';

interface ICombatStageProps {
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

enum ModalsStatus {
  None,
  ChangeInitiative,
}

export function CombatStage({ details, updateGameDetails }: ICombatStageProps): React.ReactElement {
  const [modalsStatus, setModalsStatus] = React.useState<ModalsStatus>(ModalsStatus.None);
  const [currentPlayer, setCurrentPlayer] = React.useState<IPlayer | null>(null);

  function onCloseModal(): void {
    setModalsStatus(ModalsStatus.None);
    setCurrentPlayer(null);
  }

  const onNextPlayer = (): void => {
    const activePlayers = [...details.players, ...details.allies, ...details.enemies]
      .filter((p) => p.status !== PlayerStatus.Paused)
      .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const currentPlayerIndex = activePlayers.findIndex((p) => p.id === details.currentPlayerId);
    const nextPlayerIndex = currentPlayerIndex === -1 ? 0 : (currentPlayerIndex + 1) % activePlayers.length;
    const nextPlayerId = activePlayers[nextPlayerIndex].id;
    updateGameDetails({
      ...details,
      currentPlayerId: nextPlayerId,
      round: details.round + (currentPlayerIndex === activePlayers.length - 1 ? 1 : 0),
    });
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
  };

  function onRequestToggleUserPaused(player: IPlayer): void {
    if (player.status === PlayerStatus.Active || typeof player.initiative === 'number') {
      const typeKey = getDetailsKeyByPlayerType(player.type);

      updateGameDetails(
        updatePlayersOrder({
          ...details,
          [typeKey]: details[typeKey].map((p) =>
            p.id === player.id
              ? { ...p, status: p.status === PlayerStatus.Active ? PlayerStatus.Paused : PlayerStatus.Active }
              : p
          ),
        })
      );
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
        <button className={'btn'} onClick={onNextPlayer}>
          Next Player
        </button>
        <button className={clsx('btn', styles.change_status)} onClick={onFinishCombat}>
          Finish Combat
        </button>
      </div>
      <PlayersTable
        details={details}
        setCurrentPlayer={() => {}}
        setModalsStatus={() => {}}
        onRequestToggleUserPaused={onRequestToggleUserPaused}
      />
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
