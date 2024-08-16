import React, { useMemo } from 'react';
import { PlayerRow } from '@/components/PlayerRow/PlayerRow';
import { ModalsStatus } from '@/components/SetupStage/SetupStage';
import { GameStatus, type IGameDetails, type IPlayer } from '@/types';

interface IPlayerProps {
  details: IGameDetails;
  setCurrentPlayer: (p: IPlayer | null) => void;
  setModalsStatus: (s: ModalsStatus) => void;
  onRequestToggleUserPaused: (player: IPlayer) => void;
}

export function PlayersTable({
  details,
  setCurrentPlayer,
  setModalsStatus,
  onRequestToggleUserPaused,
}: IPlayerProps): React.ReactElement {
  function onRequestDeletePlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.DeletePlayer);
  }

  function onRequestEditPlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.ChangeInitiative);
  }

  const players = useMemo(() => {
    if (details.status === GameStatus.Setup) {
      return [...details.players, ...details.allies, ...details.enemies];
    } else if (details.status === GameStatus.Combat) {
      return [...details.players, ...details.allies, ...details.enemies].toSorted(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
    }
    return [];
  }, [details]);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Initiative</th>
          <th>Dex</th>
          <th>Order</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onDelete={onRequestDeletePlayer}
            onEdit={onRequestEditPlayer}
            onTogglePause={onRequestToggleUserPaused}
            isCurrentPlayer={details.currentPlayerId === player.id}
            isCombatStage={details.status === GameStatus.Combat}
          />
        ))}
      </tbody>
    </table>
  );
}
