export interface IGame {
  title: string;
  id: string;
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
  id: string;
  dex: number | null;
  initiative: number | null;
  name: string;
  order: number | undefined;
  status: PlayerStatus;
  type: PlayerType;
}

export interface IGameDetails {
  gameId: string;
  status: GameStatus;
  players: IPlayer[];
  allies: IPlayer[];
  enemies: IPlayer[];
  round: number;
  currentPlayerId?: string;
}
