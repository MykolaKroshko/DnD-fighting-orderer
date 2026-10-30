import { type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';
import { createEmptyGameDetails } from '@/utils';

let nextId = 0;

export const makePlayer = (overrides: Partial<IPlayer> = {}): IPlayer => ({
  id: `p${++nextId}`,
  name: 'Name',
  type: PlayerType.Player,
  status: PlayerStatus.Active,
  initiative: 10,
  dex: null,
  order: undefined,
  ...overrides,
});

export const makeDetails = (
  { players = [], allies = [], enemies = [] }: Partial<Pick<IGameDetails, 'players' | 'allies' | 'enemies'>>,
  overrides: Partial<IGameDetails> = {}
): IGameDetails => ({ ...createEmptyGameDetails('game'), players, allies, enemies, ...overrides });

/** The modal root that contains `inner` (the closest ancestor with a footer), so queries can be scoped to one modal. */
export const getModal = (inner: HTMLElement): HTMLElement => {
  let el = inner;
  while (el.parentElement !== null && el.querySelector(':scope > footer') === null) {
    el = el.parentElement;
  }
  return el;
};
