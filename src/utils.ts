import { GameStatus, type IGame, type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';

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

export const getPlayerName = (name: string): string => (name.trim() === '' ? 'Unnamed' : name);

export const getGameTitle = (title: string): string => (title.trim() === '' ? 'Untitled game' : title);

export const createGame = (title: string): IGame => ({ id: crypto.randomUUID(), title: title.trim() });

export const createPlayer = (data: Omit<IPlayer, 'id'>): IPlayer => ({ ...data, id: crypto.randomUUID() });

export const createEmptyGameDetails = (gameId: string): IGameDetails => ({
  gameId,
  status: GameStatus.Setup,
  players: [],
  allies: [],
  enemies: [],
  round: 1,
});

/** Empty or invalid input becomes `null`; with `integer` set, decimals are invalid too. */
export const parseNumberInput = (value: string, { integer }: { integer: boolean }): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed))) {
    return null;
  }

  return parsed;
};

export const getAllPlayers = (details: IGameDetails): IPlayer[] => [
  ...details.players,
  ...details.allies,
  ...details.enemies,
];

const TYPE_RANK: Record<PlayerType, number> = {
  [PlayerType.Player]: 0,
  [PlayerType.Ally]: 1,
  [PlayerType.Enemy]: 2,
};

/** Descending order, `null` goes last. */
const compareNullableDesc = (a: number | null, b: number | null): number => {
  if (a === b) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return b - a;
};

const comparePlayers = (a: IPlayer, b: IPlayer): number => {
  const aPaused = a.status === PlayerStatus.Paused;
  const bPaused = b.status === PlayerStatus.Paused;

  if (aPaused !== bPaused) {
    return aPaused ? 1 : -1;
  }

  if (aPaused) {
    return TYPE_RANK[a.type] - TYPE_RANK[b.type] || a.name.localeCompare(b.name);
  }

  const byInitiative = compareNullableDesc(a.initiative, b.initiative);
  if (byInitiative !== 0) {
    return byInitiative;
  }

  const aIsPlayer = a.type === PlayerType.Player;
  const bIsPlayer = b.type === PlayerType.Player;
  if (aIsPlayer !== bIsPlayer) {
    return aIsPlayer ? -1 : 1;
  }

  return compareNullableDesc(a.dex, b.dex);
};

/** Active participants in turn order. */
export const getActivePlayers = (details: IGameDetails): IPlayer[] =>
  getAllPlayers(details)
    .filter((p) => p.status === PlayerStatus.Active)
    .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const updatePlayersOrder = (details: IGameDetails): IGameDetails => {
  const allPlayers = getAllPlayers(details)
    .toSorted(comparePlayers)
    .map((p, i) => ({ ...p, order: i + 1 }));
  const activePlayers = allPlayers.filter((p) => p.status === PlayerStatus.Active);
  const currentIsActive = activePlayers.some((p) => p.id === details.currentPlayerId);

  return {
    ...details,
    status: GameStatus.Combat,
    players: allPlayers.filter((p) => p.type === PlayerType.Player),
    allies: allPlayers.filter((p) => p.type === PlayerType.Ally),
    enemies: allPlayers.filter((p) => p.type === PlayerType.Enemy),
    currentPlayerId: currentIsActive ? details.currentPlayerId : activePlayers[0]?.id,
  };
};

/** Why combat cannot start, or `null` when it can. */
export const getStartCombatBlockReason = (details: IGameDetails): string | null => {
  const allPlayers = getAllPlayers(details);
  if (allPlayers.length === 0) {
    return 'Add at least one participant to start the combat.';
  }

  const activePlayers = allPlayers.filter((p) => p.status === PlayerStatus.Active);
  if (activePlayers.length === 0) {
    return 'All participants are paused. Unpause at least one to start the combat.';
  }

  const withoutInitiative = activePlayers.filter((p) => typeof p.initiative !== 'number');
  if (withoutInitiative.length > 0) {
    return `Set an initiative for: ${withoutInitiative.map((p) => getPlayerName(p.name)).join(', ')}.`;
  }

  return null;
};

/** Why the turn cannot advance, or `null` when it can. */
export const getNextTurnBlockReason = (details: IGameDetails): string | null =>
  getActivePlayers(details).length === 0 ? 'Everyone is paused. Unpause someone to continue.' : null;

export const advanceTurn = (details: IGameDetails): IGameDetails => {
  const activePlayers = getActivePlayers(details);
  if (activePlayers.length === 0) {
    return details;
  }

  const currentIndex = activePlayers.findIndex((p) => p.id === details.currentPlayerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % activePlayers.length;

  return {
    ...details,
    currentPlayerId: activePlayers[nextIndex].id,
    round: details.round + (currentIndex !== -1 && nextIndex === 0 ? 1 : 0),
  };
};

/**
 * Pauses or unpauses a participant. During combat the order is recalculated, and when the
 * participant whose turn it is gets paused, the turn passes to the next active one in order.
 */
export const toggleParticipantPause = (details: IGameDetails, player: IPlayer): IGameDetails => {
  const typeKey = getDetailsKeyByPlayerType(player.type);
  const target = details[typeKey].find((p) => p.id === player.id);
  if (target === undefined) {
    return details;
  }

  const nextStatus = target.status === PlayerStatus.Active ? PlayerStatus.Paused : PlayerStatus.Active;
  const toggled: IGameDetails = {
    ...details,
    [typeKey]: details[typeKey].map((p) => (p.id === target.id ? { ...p, status: nextStatus } : p)),
  };

  if (details.status !== GameStatus.Combat) {
    return toggled;
  }

  let { currentPlayerId, round } = details;
  if (nextStatus === PlayerStatus.Paused && currentPlayerId === target.id) {
    const activeBefore = getActivePlayers(details);
    const remaining = activeBefore.filter((p) => p.id !== target.id);
    const targetIndex = activeBefore.findIndex((p) => p.id === target.id);
    const wrapped = targetIndex >= remaining.length;

    currentPlayerId = remaining[wrapped ? 0 : targetIndex]?.id;
    round += currentPlayerId !== undefined && wrapped ? 1 : 0;
  }

  return updatePlayersOrder({ ...toggled, currentPlayerId, round });
};
