export interface IGame {
  title: string;
  id: number;
}

export enum GameStatus {
  Setup = 'Setup',
  Combat = 'Combat',
}

export enum PlayerType {
  player = 'player',
  ally = 'ally',
  enemy = 'enemy',
}

interface IPlayer {
  name: string;
  type: PlayerType;
  initiative: number;
  dex?: number;
}

export interface IGameDetails {
  gameId: number;
  status: GameStatus;
  players: IPlayer[];
  allies: IPlayer[];
  enemies: IPlayer[];
  round: number;
}
