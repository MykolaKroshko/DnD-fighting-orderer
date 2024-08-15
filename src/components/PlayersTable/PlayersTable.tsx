import React from 'react';
import { PlayerRow } from '@/components/PlayerRow/PlayerRow';
import { ModalsStatus } from '@/components/SetupStage/SetupStage';
import { type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';

interface IPlayerProps {
  details: IGameDetails;
  setCurrentPlayer: (p: IPlayer | null) => void;
  setModalsStatus: (s: ModalsStatus) => void;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

export function PlayersTable({
  details,
  setCurrentPlayer,
  setModalsStatus,
  updateGameDetails,
}: IPlayerProps): React.ReactElement {
  function onRequestDeletePlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.DeletePlayer);
  }

  function onRequestEditPlayer(player: IPlayer): void {
    setCurrentPlayer(player);
    setModalsStatus(ModalsStatus.ChangeInitiative);
  }

  function onRequestToggleUserPaused(player: IPlayer): void {
    const typeKey =
      player.type === PlayerType.Player ? 'players' : player.type === PlayerType.Ally ? 'allies' : 'enemies';
    updateGameDetails({
      ...details,
      [typeKey]: [
        ...details[typeKey].map((p) =>
          p.id === player.id
            ? { ...p, status: p.status === PlayerStatus.Active ? PlayerStatus.Paused : PlayerStatus.Active }
            : p
        ),
      ],
    });
  }

  return (
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
          <PlayerRow
            key={player.id}
            player={player}
            onDelete={onRequestDeletePlayer}
            onEdit={onRequestEditPlayer}
            onTogglePause={onRequestToggleUserPaused}
          />
        ))}
        {details.allies.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onDelete={onRequestDeletePlayer}
            onEdit={onRequestEditPlayer}
            onTogglePause={onRequestToggleUserPaused}
          />
        ))}
        {details.enemies.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onDelete={onRequestDeletePlayer}
            onEdit={onRequestEditPlayer}
            onTogglePause={onRequestToggleUserPaused}
          />
        ))}
      </tbody>
    </table>
  );
}
