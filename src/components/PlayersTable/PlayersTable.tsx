import React, { useMemo } from 'react';
import { PlayerRow } from '@/components/PlayerRow/PlayerRow';
import { GameStatus, type IGameDetails, type IPlayer } from '@/types';

interface IPlayerProps {
  details: IGameDetails;
  onEdit?: (player: IPlayer) => void;
  onDelete?: (player: IPlayer) => void;
  onRequestToggleUserPaused: (player: IPlayer) => void;
}

export function PlayersTable({
  details,
  onEdit,
  onDelete,
  onRequestToggleUserPaused,
}: IPlayerProps): React.ReactElement {
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
            onDelete={onDelete}
            onEdit={onEdit}
            onTogglePause={onRequestToggleUserPaused}
            isCurrentPlayer={details.currentPlayerId === player.id}
            isCombatStage={details.status === GameStatus.Combat}
          />
        ))}
      </tbody>
    </table>
  );
}
