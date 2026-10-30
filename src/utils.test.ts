import { GameStatus, type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';
import {
  advanceTurn,
  createEmptyGameDetails,
  createGame,
  createPlayer,
  getActivePlayers,
  getDetailsKeyByPlayerType,
  getGameTitle,
  getNextTurnBlockReason,
  getPlayerName,
  getStartCombatBlockReason,
  parseNumberInput,
  toggleParticipantPause,
  updatePlayersOrder,
} from '@/utils';

let nextId = 0;
const player = (overrides: Partial<IPlayer> = {}): IPlayer => ({
  id: `p${++nextId}`,
  name: 'Name',
  type: PlayerType.Player,
  status: PlayerStatus.Active,
  initiative: 10,
  dex: null,
  order: undefined,
  ...overrides,
});

const details = (
  { players = [], allies = [], enemies = [] }: Partial<Pick<IGameDetails, 'players' | 'allies' | 'enemies'>>,
  overrides: Partial<IGameDetails> = {}
): IGameDetails => ({ ...createEmptyGameDetails('game'), players, allies, enemies, ...overrides });

const orderedNames = (d: IGameDetails): string[] =>
  [...d.players, ...d.allies, ...d.enemies].toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p) => p.name);

describe('parseNumberInput', () => {
  it.each([
    ['', null],
    ['   ', null],
    ['abc', null],
    ['Infinity', null],
    ['12', 12],
    [' 7 ', 7],
    ['-3', -3],
    ['7.5', 7.5],
    ['0', 0],
  ])('parses %j as %j when decimals are allowed', (input, expected) => {
    expect(parseNumberInput(input, { integer: false })).toBe(expected);
  });

  it('rejects decimals in integer mode', () => {
    expect(parseNumberInput('7.5', { integer: true })).toBeNull();
    expect(parseNumberInput('-4', { integer: true })).toBe(-4);
  });
});

describe('names and factories', () => {
  it('falls back to placeholders for blank names', () => {
    expect(getPlayerName('  ')).toBe('Unnamed');
    expect(getPlayerName('Goblin')).toBe('Goblin');
    expect(getGameTitle('')).toBe('Untitled game');
    expect(getGameTitle('Campaign')).toBe('Campaign');
  });

  it('creates games and players with unique string ids', () => {
    const a = createGame(' Campaign ');
    const b = createGame('Campaign');
    expect(a.title).toBe('Campaign');
    expect(typeof a.id).toBe('string');
    expect(a.id).not.toBe(b.id);

    const { id, ...data } = player({ name: 'Elf' });
    const created = createPlayer(data);
    expect(created.name).toBe('Elf');
    expect(typeof created.id).toBe('string');
    expect(created.id).not.toBe(id);
    expect(created.id).not.toBe(createPlayer(data).id);
  });
});

describe('updatePlayersOrder', () => {
  it('sorts by initiative descending, including decimals and negatives', () => {
    const result = updatePlayersOrder(
      details({
        players: [
          player({ name: 'low', initiative: -2 }),
          player({ name: 'mid', initiative: 10 }),
          player({ name: 'precise', initiative: 10.5 }),
        ],
      })
    );
    expect(orderedNames(result)).toEqual(['precise', 'mid', 'low']);
    expect(result.status).toBe(GameStatus.Combat);
  });

  it('puts players before allies and enemies on equal initiative, then higher dex first', () => {
    const result = updatePlayersOrder(
      details({
        players: [player({ name: 'hero', initiative: 12, dex: 1 })],
        allies: [player({ name: 'ally', type: PlayerType.Ally, initiative: 12, dex: 20 })],
        enemies: [
          player({ name: 'orc', type: PlayerType.Enemy, initiative: 12, dex: 5 }),
          player({ name: 'goblin', type: PlayerType.Enemy, initiative: 12, dex: 15 }),
        ],
      })
    );
    expect(orderedNames(result)).toEqual(['hero', 'ally', 'goblin', 'orc']);
  });

  it('puts paused participants last in a stable order: type, then name', () => {
    const paused = (name: string, type: PlayerType): IPlayer =>
      player({ name, type, status: PlayerStatus.Paused, initiative: 99 });
    const expected = ['active', 'pA', 'pB', 'ally', 'enemy'];
    const forward = details({
      players: [
        player({ name: 'active', initiative: 1 }),
        paused('pB', PlayerType.Player),
        paused('pA', PlayerType.Player),
      ],
      allies: [paused('ally', PlayerType.Ally)],
      enemies: [paused('enemy', PlayerType.Enemy)],
    });

    expect(orderedNames(updatePlayersOrder(forward))).toEqual(expected);
    const reversed = { ...forward, players: forward.players.toReversed() };
    expect(orderedNames(updatePlayersOrder(reversed))).toEqual(expected);
  });

  it('assigns a 1-based order', () => {
    const result = updatePlayersOrder(details({ players: [player({ initiative: 1 }), player({ initiative: 2 })] }));
    expect(result.players.map((p) => p.order).toSorted()).toEqual([1, 2]);
  });

  it('does not throw on an empty list and leaves no current participant', () => {
    const result = updatePlayersOrder(details({}));
    expect(result.currentPlayerId).toBeUndefined();
  });

  it('picks the first active participant as current, never a paused one', () => {
    const paused = player({ name: 'paused', initiative: 50, status: PlayerStatus.Paused });
    const active = player({ name: 'active', initiative: 1 });
    expect(updatePlayersOrder(details({ players: [paused, active] })).currentPlayerId).toBe(active.id);
    expect(updatePlayersOrder(details({ players: [paused] })).currentPlayerId).toBeUndefined();
  });

  it('keeps the current participant when still active', () => {
    const a = player({ initiative: 20 });
    const b = player({ initiative: 5 });
    expect(updatePlayersOrder(details({ players: [a, b] }, { currentPlayerId: b.id })).currentPlayerId).toBe(b.id);
  });
});

describe('getStartCombatBlockReason', () => {
  it('blocks when there are no participants', () => {
    expect(getStartCombatBlockReason(details({}))).toMatch(/at least one participant/);
  });

  it('blocks when everyone is paused', () => {
    const d = details({ players: [player({ status: PlayerStatus.Paused })] });
    expect(getStartCombatBlockReason(d)).toMatch(/paused/);
  });

  it('blocks and names active participants without an initiative', () => {
    const d = details({
      players: [player({ name: 'Anna', initiative: null }), player({ name: '', initiative: null })],
      enemies: [player({ name: 'Orc', type: PlayerType.Enemy, initiative: 3 })],
    });
    const reason = getStartCombatBlockReason(d);
    expect(reason).toContain('Anna');
    expect(reason).toContain('Unnamed');
    expect(reason).not.toContain('Orc');
  });

  it('ignores paused participants without an initiative', () => {
    const d = details({
      players: [player({ initiative: 4 }), player({ initiative: null, status: PlayerStatus.Paused })],
    });
    expect(getStartCombatBlockReason(d)).toBeNull();
  });

  it('allows an initiative of 0 and negative values', () => {
    expect(
      getStartCombatBlockReason(details({ players: [player({ initiative: 0 }), player({ initiative: -1 })] }))
    ).toBeNull();
  });
});

describe('advanceTurn', () => {
  const combat = (): { d: IGameDetails; a: IPlayer; b: IPlayer; c: IPlayer } => {
    const a = player({ name: 'a', initiative: 30 });
    const b = player({ name: 'b', initiative: 20 });
    const c = player({ name: 'c', initiative: 10 });
    return { d: updatePlayersOrder(details({ players: [a, b, c] })), a, b, c };
  };

  it('moves to the next participant without changing the round', () => {
    const { d, b } = combat();
    const next = advanceTurn(d);
    expect(next.currentPlayerId).toBe(b.id);
    expect(next.round).toBe(1);
  });

  it('wraps around and starts a new round', () => {
    const { d, a, c } = combat();
    const result = advanceTurn({ ...d, currentPlayerId: c.id });
    expect(result.currentPlayerId).toBe(a.id);
    expect(result.round).toBe(2);
  });

  it('skips paused participants', () => {
    const { d, a, b, c } = combat();
    const pausedB = toggleParticipantPause(d, b);
    expect(advanceTurn(pausedB).currentPlayerId).toBe(c.id);
    expect(pausedB.currentPlayerId).toBe(a.id);
  });

  it('does nothing when no one is active', () => {
    const d = updatePlayersOrder(details({ players: [player({ status: PlayerStatus.Paused })] }));
    expect(advanceTurn(d)).toBe(d);
    expect(getNextTurnBlockReason(d)).not.toBeNull();
  });
});

describe('toggleParticipantPause', () => {
  const setup = (): { d: IGameDetails; a: IPlayer; b: IPlayer; c: IPlayer } => {
    const a = player({ name: 'a', initiative: 30 });
    const b = player({ name: 'b', initiative: 20 });
    const c = player({ name: 'c', initiative: 10 });
    return { d: updatePlayersOrder(details({ players: [a, b, c] })), a, b, c };
  };

  it('only flips the status during setup', () => {
    const a = player({ initiative: null });
    const result = toggleParticipantPause(details({ players: [a] }), a);
    expect(result.status).toBe(GameStatus.Setup);
    expect(result.players[0].status).toBe(PlayerStatus.Paused);
    expect(result.players[0].order).toBeUndefined();
  });

  it('passes the turn to the next participant when the current one is paused', () => {
    const { d, a, b } = setup();
    const result = toggleParticipantPause(d, a);
    expect(result.currentPlayerId).toBe(b.id);
    expect(result.round).toBe(1);
  });

  it('wraps to the first participant and increments the round when the last one is paused', () => {
    const { d, a, c } = setup();
    const result = toggleParticipantPause({ ...d, currentPlayerId: c.id }, c);
    expect(result.currentPlayerId).toBe(a.id);
    expect(result.round).toBe(2);
  });

  it('leaves the turn alone when someone else is paused', () => {
    const { d, a, c } = setup();
    const result = toggleParticipantPause(d, c);
    expect(result.currentPlayerId).toBe(a.id);
    expect(result.round).toBe(1);
  });

  it('clears the turn when the last active participant is paused, and restores it on unpause', () => {
    const only = player({ initiative: 5 });
    const combat = updatePlayersOrder(details({ players: [only] }));
    const paused = toggleParticipantPause(combat, only);
    expect(paused.currentPlayerId).toBeUndefined();
    expect(paused.round).toBe(1);
    expect(getActivePlayers(paused)).toHaveLength(0);

    const unpaused = toggleParticipantPause(paused, paused.players[0]);
    expect(unpaused.currentPlayerId).toBe(only.id);
  });

  it('recalculates the order when unpausing', () => {
    const { d, b } = setup();
    const result = toggleParticipantPause(toggleParticipantPause(d, b), b);
    expect(orderedNames(result)).toEqual(['a', 'b', 'c']);
  });

  it('returns the details unchanged for an unknown participant', () => {
    const d = details({ players: [player()] });
    expect(toggleParticipantPause(d, player({ id: 'ghost' }))).toBe(d);
  });

  it('does not look for the participant in a different type array', () => {
    const hero = player();
    const d = details({ players: [hero] });
    expect(toggleParticipantPause(d, { ...hero, type: PlayerType.Enemy })).toBe(d);
  });

  it('keeps the round when the paused current participant is not last', () => {
    const { d, a } = setup();
    expect(toggleParticipantPause(d, a).round).toBe(1);
  });
});

describe('getDetailsKeyByPlayerType', () => {
  it('maps each participant type to its array key', () => {
    expect(getDetailsKeyByPlayerType(PlayerType.Player)).toBe('players');
    expect(getDetailsKeyByPlayerType(PlayerType.Ally)).toBe('allies');
    expect(getDetailsKeyByPlayerType(PlayerType.Enemy)).toBe('enemies');
  });
});

describe('createEmptyGameDetails', () => {
  it('starts in setup, on round 1, with no participants or current participant', () => {
    expect(createEmptyGameDetails('g1')).toEqual({
      gameId: 'g1',
      status: GameStatus.Setup,
      players: [],
      allies: [],
      enemies: [],
      round: 1,
    });
  });
});

describe('updatePlayersOrder edge cases', () => {
  it('puts participants without initiative after those with one, even a negative one', () => {
    const result = updatePlayersOrder(
      details({ players: [player({ name: 'none', initiative: null }), player({ name: 'neg', initiative: -5 })] })
    );
    expect(orderedNames(result)).toEqual(['neg', 'none']);
  });

  it('puts participants without dex after those with one on a tie', () => {
    const result = updatePlayersOrder(
      details({ players: [player({ name: 'nodex', dex: null }), player({ name: 'dex', dex: 0 })] })
    );
    expect(orderedNames(result)).toEqual(['dex', 'nodex']);
  });

  it('keeps input order for a full tie', () => {
    const result = updatePlayersOrder(details({ players: [player({ name: 'first' }), player({ name: 'second' })] }));
    expect(orderedNames(result)).toEqual(['first', 'second']);
  });

  it('splits participants back into their own arrays', () => {
    const result = updatePlayersOrder(
      details({
        players: [player({ name: 'hero' })],
        allies: [player({ name: 'ally', type: PlayerType.Ally })],
        enemies: [player({ name: 'orc', type: PlayerType.Enemy })],
      })
    );
    expect(result.players.map((p) => p.name)).toEqual(['hero']);
    expect(result.allies.map((p) => p.name)).toEqual(['ally']);
    expect(result.enemies.map((p) => p.name)).toEqual(['orc']);
  });

  it('does not mutate its input', () => {
    const input = details({ players: [player({ initiative: 1 }), player({ initiative: 2 })] });
    const snapshot = structuredClone(input);
    updatePlayersOrder(input);
    expect(input).toEqual(snapshot);
  });
});

describe('getActivePlayers', () => {
  it('returns only active participants sorted by order', () => {
    const d = updatePlayersOrder(
      details({
        players: [player({ name: 'slow', initiative: 1 }), player({ name: 'paused', status: PlayerStatus.Paused })],
        enemies: [player({ name: 'fast', type: PlayerType.Enemy, initiative: 9 })],
      })
    );
    expect(getActivePlayers(d).map((p) => p.name)).toEqual(['fast', 'slow']);
  });
});

describe('getNextTurnBlockReason', () => {
  it('allows the turn to advance while someone is active', () => {
    const d = updatePlayersOrder(details({ players: [player()] }));
    expect(getNextTurnBlockReason(d)).toBeNull();
  });

  it('blocks when everyone is paused', () => {
    const d = updatePlayersOrder(details({ players: [player({ status: PlayerStatus.Paused })] }));
    expect(getNextTurnBlockReason(d)).toMatch(/paused/);
  });
});

describe('advanceTurn edge cases', () => {
  it('starts from the first participant without a new round when the current one is unknown', () => {
    const a = player({ initiative: 20 });
    const b = player({ initiative: 10 });
    const d = { ...updatePlayersOrder(details({ players: [a, b] })), currentPlayerId: undefined };
    const result = advanceTurn(d);
    expect(result.currentPlayerId).toBe(a.id);
    expect(result.round).toBe(1);
  });

  it('keeps a lone participant current and counts a round on every turn', () => {
    const only = player();
    const d = updatePlayersOrder(details({ players: [only] }));
    const result = advanceTurn(advanceTurn(d));
    expect(result.currentPlayerId).toBe(only.id);
    expect(result.round).toBe(3);
  });

  it('does not mutate its input', () => {
    const d = updatePlayersOrder(details({ players: [player({ initiative: 2 }), player({ initiative: 1 })] }));
    const snapshot = structuredClone(d);
    advanceTurn(d);
    expect(d).toEqual(snapshot);
  });
});
