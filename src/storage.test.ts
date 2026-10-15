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
