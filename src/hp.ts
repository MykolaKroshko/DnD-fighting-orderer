import { type IGameDetails, type IPlayer } from '@/types';
import { getDetailsKeyByPlayerType, getAllPlayers } from '@/utils';

/** The effective maximum HP. Always read the maximum through this helper. */
export const getMaxHp = (player: IPlayer): number => player.maxHp;

/** Normalises HP values: a whole `maxHp` of at least 1 and a whole `hp` from 0 up to the effective maximum. */
export const setPlayerHp = (player: IPlayer, { maxHp, hp }: { maxHp: number; hp: number }): IPlayer => {
  const nextMaxHp = Number.isInteger(maxHp) && maxHp >= 1 ? maxHp : 1;
  const withMax = { ...player, maxHp: nextMaxHp };
  const nextHp = Number.isInteger(hp) ? Math.min(Math.max(hp, 0), getMaxHp(withMax)) : getMaxHp(withMax);
  return { ...withMax, hp: nextHp };
};

export const findPlayer = (details: IGameDetails, playerId: string): IPlayer | undefined =>
  getAllPlayers(details).find((player) => player.id === playerId);

const updatePlayer = (details: IGameDetails, playerId: string, update: (player: IPlayer) => IPlayer): IGameDetails => {
  const player = findPlayer(details, playerId);
  if (player === undefined) {
    return details;
  }

  const key = getDetailsKeyByPlayerType(player.type);
  return { ...details, [key]: details[key].map((p) => (p.id === playerId ? update(p) : p)) };
};

export const damagePlayer = (details: IGameDetails, playerId: string, amount: number): IGameDetails =>
  updatePlayer(details, playerId, (player) => ({ ...player, hp: Math.max(0, player.hp - amount) }));

export const healPlayer = (details: IGameDetails, playerId: string, amount: number): IGameDetails =>
  updatePlayer(details, playerId, (player) => ({ ...player, hp: Math.min(getMaxHp(player), player.hp + amount) }));

export const restorePlayer = (details: IGameDetails, playerId: string): IGameDetails =>
  updatePlayer(details, playerId, (player) => ({ ...player, hp: getMaxHp(player) }));
