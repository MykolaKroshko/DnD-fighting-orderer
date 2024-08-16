import { GameStatus, type IGameDetails, PlayerStatus, PlayerType } from '@/types';

export const getDetailsKeyByPlayerType = (type: PlayerType): 'players' | 'allies' | 'enemies' => {
  switch (type) {
    case PlayerType.Player:
      return 'players';
    case PlayerType.Ally:
      return 'allies';
    case PlayerType.Enemy:
      return 'enemies';
  }
};

export const updatePlayersOrder = (details: IGameDetails): IGameDetails => {
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

  return {
    ...details,
    status: GameStatus.Combat,
    players: allPlayers.filter((p) => p.type === PlayerType.Player),
    allies: allPlayers.filter((p) => p.type === PlayerType.Ally),
    enemies: allPlayers.filter((p) => p.type === PlayerType.Enemy),
    currentPlayerId: details.currentPlayerId ?? allPlayers[0].id,
  };
};
