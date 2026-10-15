import { GameStatus, type IGame, type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';
import { createEmptyGameDetails } from '@/utils';

const LS_LIST_KEY = 'dnd_fo_games_list';
const LS_GAME_DETAIL_KEY = 'dnd_fo_game_details';

const getDetailsKey = (gameId: string): string => `${LS_GAME_DETAIL_KEY}__${gameId}`;

const readJson = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage is full or unavailable, nothing else can be done
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T => values.includes(value as T);

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const parseGame = (value: unknown): IGame | null =>
  isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string'
    ? { id: value.id, title: value.title }
    : null;

const parsePlayer = (value: unknown): IPlayer | null => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    !isOneOf(Object.values(PlayerType), value.type) ||
    !isOneOf(Object.values(PlayerStatus), value.status)
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    type: value.type,
    status: value.status,
    initiative: toNumberOrNull(value.initiative),
    dex: toNumberOrNull(value.dex),
    order: toNumberOrNull(value.order) ?? undefined,
  };
};

/** `null` when any item is invalid, so a damaged value is never half-loaded. */
const parseList = <T>(value: unknown, parseItem: (item: unknown) => T | null): T[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value.map(parseItem);
  return items.every((item) => item !== null) ? items : null;
};

const parseGameDetails = (value: unknown, gameId: string): IGameDetails | null => {
  if (!isRecord(value) || !isOneOf(Object.values(GameStatus), value.status)) {
    return null;
  }

  const players = parseList(value.players, parsePlayer);
  const allies = parseList(value.allies, parsePlayer);
  const enemies = parseList(value.enemies, parsePlayer);
  const round = toNumberOrNull(value.round);
  if (players === null || allies === null || enemies === null || round === null) {
    return null;
  }

  return {
    gameId,
    status: value.status,
    players,
    allies,
    enemies,
    round,
    currentPlayerId: typeof value.currentPlayerId === 'string' ? value.currentPlayerId : undefined,
  };
};

export const getGamesList = (): IGame[] => parseList(readJson(LS_LIST_KEY), parseGame) ?? [];

export const setGamesList = (games: IGame[]): void => {
  writeJson(LS_LIST_KEY, games);
};

export const getGameDetails = (gameId: string): IGameDetails =>
  parseGameDetails(readJson(getDetailsKey(gameId)), gameId) ?? createEmptyGameDetails(gameId);

export const setGameDetails = (details: IGameDetails): void => {
  writeJson(getDetailsKey(details.gameId), details);
};

export const removeGameDetails = (gameId: string): void => {
  try {
    localStorage.removeItem(getDetailsKey(gameId));
  } catch {
    // storage is unavailable, nothing else can be done
  }
};
