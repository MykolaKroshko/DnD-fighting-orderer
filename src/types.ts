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

export enum PlayerStatus {
  Active = 'active',
  Paused = 'paused',
}

export interface IPlayer {
  id: number;
  dex: number | null;
  initiative: number | null;
  name: string;
  order: number | undefined;
  status: PlayerStatus;
  type: PlayerType;
}

export interface IGameDetails {
  gameId: number;
  status: GameStatus;
  players: IPlayer[];
  allies: IPlayer[];
  enemies: IPlayer[];
  round: number;
  currentPlayerId?: number;
}
