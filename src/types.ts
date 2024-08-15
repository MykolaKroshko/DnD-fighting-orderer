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
  name: string;
  type: PlayerType;
  initiative: number | null;
  dex: number | null;
  status: PlayerStatus;
}

export interface IGameDetails {
  gameId: number;
  status: GameStatus;
  players: IPlayer[];
  allies: IPlayer[];
  enemies: IPlayer[];
  round: number;
}
