export interface IGame {
  title: string;
  id: number;
}

export enum GameStatus {
  Setup = 'Setup',
  Combat = 'Combat',
}

export enum PlayerType {
  Player = 'player',
  Ally = 'ally',
  Enemy = 'enemy',
}

export interface IPlayer {
  id: number;
  name: string;
  type: PlayerType;
  initiative?: number;
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
