import { getGameDetails, getGamesList, removeGameDetails, setGameDetails, setGamesList } from '@/storage';
import { GameStatus, type IGameDetails, PlayerStatus, PlayerType } from '@/types';
import { createEmptyGameDetails } from '@/utils';

const GAMES_KEY = 'dnd_fo_games_list';
const detailsKey = (id: string): string => `dnd_fo_game_details__${id}`;

const storedPlayer = {
  id: 'p1',
  name: 'Hero',
  type: PlayerType.Player,
  status: PlayerStatus.Active,
  initiative: 12.5,
  dex: 3,
  order: 1,
};

describe('games list', () => {
  it('round-trips', () => {
    const games = [{ id: 'a', title: 'First' }];
    setGamesList(games);
    expect(getGamesList()).toEqual(games);
  });

  it('is empty when nothing is stored', () => {
    expect(getGamesList()).toEqual([]);
  });

  it('is empty for corrupt JSON', () => {
    localStorage.setItem(GAMES_KEY, '{not json');
    expect(getGamesList()).toEqual([]);
  });

  it('is empty for the wrong shape', () => {
    localStorage.setItem(GAMES_KEY, JSON.stringify({ id: 'a' }));
    expect(getGamesList()).toEqual([]);
  });

  it('rejects data saved with numeric ids', () => {
    localStorage.setItem(GAMES_KEY, JSON.stringify([{ id: 123, title: 'Old game' }]));
    expect(getGamesList()).toEqual([]);
  });
});

describe('game details', () => {
  it('round-trips', () => {
    const details: IGameDetails = {
      ...createEmptyGameDetails('g1'),
      status: GameStatus.Combat,
      players: [storedPlayer],
      round: 3,
      currentPlayerId: 'p1',
    };
    setGameDetails(details);
    expect(getGameDetails('g1')).toEqual(details);
  });

  it('falls back to the empty state when missing', () => {
    expect(getGameDetails('missing')).toEqual(createEmptyGameDetails('missing'));
  });

  it('falls back to the empty state for corrupt JSON', () => {
    localStorage.setItem(detailsKey('g1'), 'oops');
    expect(getGameDetails('g1')).toEqual(createEmptyGameDetails('g1'));
  });

  it('falls back to the empty state for the wrong shape', () => {
    localStorage.setItem(detailsKey('g1'), JSON.stringify({ status: 'Nope', players: [] }));
    expect(getGameDetails('g1')).toEqual(createEmptyGameDetails('g1'));
  });

  it('rejects data saved with numeric ids', () => {
    const old = { ...createEmptyGameDetails('1'), players: [{ ...storedPlayer, id: 7 }] };
    localStorage.setItem(detailsKey('1'), JSON.stringify(old));
    expect(getGameDetails('1')).toEqual(createEmptyGameDetails('1'));
  });

  it('turns an empty-string or NaN initiative and dex into null', () => {
    const broken = { ...createEmptyGameDetails('g1'), players: [{ ...storedPlayer, initiative: '', dex: null }] };
    localStorage.setItem(detailsKey('g1'), JSON.stringify(broken));
    const [loaded] = getGameDetails('g1').players;
    expect(loaded.initiative).toBeNull();
    expect(loaded.dex).toBeNull();
  });

  it('removes stored details', () => {
    setGameDetails(createEmptyGameDetails('g1'));
    removeGameDetails('g1');
    expect(localStorage.getItem(detailsKey('g1'))).toBeNull();
  });
});

describe('games list validation', () => {
  it('drops the whole list when any item is invalid', () => {
    localStorage.setItem(GAMES_KEY, JSON.stringify([{ id: 'a', title: 'Fine' }, { id: 'b' }]));
    expect(getGamesList()).toEqual([]);
  });

  it('keeps only id and title of each game', () => {
    localStorage.setItem(GAMES_KEY, JSON.stringify([{ id: 'a', title: 'Fine', extra: true }]));
    expect(getGamesList()).toEqual([{ id: 'a', title: 'Fine' }]);
  });

  it('keeps blank titles', () => {
    setGamesList([{ id: 'a', title: '' }]);
    expect(getGamesList()).toEqual([{ id: 'a', title: '' }]);
  });
});

describe('game details validation', () => {
  const store = (id: string, value: unknown): void => localStorage.setItem(detailsKey(id), JSON.stringify(value));
  const empty = (id: string): IGameDetails => createEmptyGameDetails(id);

  it('uses the requested game id, not the stored one', () => {
    store('g1', { ...empty('other'), players: [storedPlayer] });
    expect(getGameDetails('g1').gameId).toBe('g1');
  });

  it.each([
    ['an unknown participant type', { type: 'Dragon' }],
    ['an unknown participant status', { status: 'Sleeping' }],
    ['a missing participant name', { name: undefined }],
  ])('falls back to the empty state for %s', (_label, override) => {
    store('g1', { ...empty('g1'), enemies: [{ ...storedPlayer, ...override }] });
    expect(getGameDetails('g1')).toEqual(empty('g1'));
  });

  it('falls back to the empty state for an unknown game status', () => {
    store('g1', { ...empty('g1'), status: 'Paused' });
    expect(getGameDetails('g1')).toEqual(empty('g1'));
  });

  it('falls back to the empty state when the round is missing', () => {
    store('g1', { ...empty('g1'), round: undefined });
    expect(getGameDetails('g1')).toEqual(empty('g1'));
  });

  it('falls back to the empty state when a participant array is missing', () => {
    store('g1', { ...empty('g1'), allies: undefined });
    expect(getGameDetails('g1')).toEqual(empty('g1'));
  });

  it('drops a non-string current participant id', () => {
    store('g1', { ...empty('g1'), currentPlayerId: 5 });
    expect(getGameDetails('g1').currentPlayerId).toBeUndefined();
  });

  it('turns a missing or invalid order into undefined', () => {
    store('g1', {
      ...empty('g1'),
      players: [{ ...storedPlayer, order: 'first' }],
      allies: [{ ...storedPlayer, id: 'p2', order: undefined }],
    });
    const loaded = getGameDetails('g1');
    expect(loaded.players[0].order).toBeUndefined();
    expect(loaded.allies[0].order).toBeUndefined();
  });

  it('keeps games independent of each other', () => {
    setGameDetails({ ...empty('g1'), round: 4 });
    setGameDetails({ ...empty('g2'), round: 7 });
    removeGameDetails('g1');
    expect(getGameDetails('g1').round).toBe(1);
    expect(getGameDetails('g2').round).toBe(7);
  });
});

describe('unavailable storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('swallows write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => {
      setGamesList([{ id: 'a', title: 'A' }]);
      setGameDetails(createEmptyGameDetails('g1'));
    }).not.toThrow();
  });

  it('swallows remove failures', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => {
      removeGameDetails('g1');
    }).not.toThrow();
  });

  it('falls back to the empty state when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(getGamesList()).toEqual([]);
    expect(getGameDetails('g1')).toEqual(createEmptyGameDetails('g1'));
  });
});
