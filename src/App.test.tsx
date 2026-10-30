import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { router } from '@/routes';
import { getGameDetails, getGamesList, setGameDetails, setGamesList } from '@/storage';
import { getModal, makePlayer } from '@/testUtils';
import { GameStatus, PlayerStatus } from '@/types';
import { createEmptyGameDetails } from '@/utils';

// The router is created when `@/routes` is imported, so the URL has to match its basename before that.
vi.hoisted(() => {
  window.history.replaceState({}, '', '/DnD-fighting-orderer/');
});

const HINT = 'Please create new game or select existing one to see its details';

beforeAll(() => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

const renderApp = async (path = '/') => {
  await act(() => router.navigate(path, { replace: true }));
  render(<App />);
  return userEvent.setup();
};

const pathname = (): string => router.state.location.pathname;

const createGameViaUi = async (user: ReturnType<typeof userEvent.setup>, title: string): Promise<void> => {
  await user.click(screen.getByRole('button', { name: 'Add new game' }));
  const modal = within(getModal(screen.getByRole('heading', { name: 'Add new game' })));
  await user.type(modal.getByLabelText('New game title'), title);
  await user.click(modal.getByRole('button', { name: 'Save' }));
};

const addParticipant = async (
  user: ReturnType<typeof userEvent.setup>,
  button: string,
  name: string,
  initiative: string
): Promise<void> => {
  await user.click(screen.getByRole('button', { name: button }));
  const modal = within(getModal(screen.getByRole('heading', { name: button })));
  await user.clear(modal.getByLabelText('Name'));
  await user.type(modal.getByLabelText('Name'), name);
  await user.type(modal.getByLabelText('Initiative'), initiative);
  await user.click(modal.getByRole('button', { name: 'Save' }));
};

const seedGame = (id: string, title: string): void => {
  setGamesList([...getGamesList(), { id, title }]);
};

describe('App', () => {
  describe('routing', () => {
    it('shows a hint when no game is open', async () => {
      await renderApp();
      expect(screen.getByText(HINT)).toBeInTheDocument();
    });

    it('opens a game from a direct link', async () => {
      seedGame('g1', 'Campaign');
      await renderApp('/g1');
      expect(screen.getByText('Stage: Setup')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Campaign' })).toBeInTheDocument();
    });

    it('redirects an unknown game id to the root', async () => {
      seedGame('g1', 'Campaign');
      await renderApp('/missing');
      expect(pathname()).toBe('/');
      expect(screen.getByText(HINT)).toBeInTheDocument();
    });

    it('redirects an unknown path to the root', async () => {
      await renderApp('/some/where/else');
      expect(pathname()).toBe('/');
    });

    it('does not read old data saved with numeric ids', async () => {
      localStorage.setItem('dnd_fo_games_list', JSON.stringify([{ id: 1, title: 'Old' }]));
      await renderApp('/1');
      expect(pathname()).toBe('/');
      expect(screen.queryByRole('link', { name: 'Old' })).not.toBeInTheDocument();
    });
  });

  describe('games', () => {
    it('creates a game, opens it and saves the list', async () => {
      const user = await renderApp();
      await createGameViaUi(user, 'Campaign');

      const [game] = getGamesList();
      expect(game.title).toBe('Campaign');
      expect(pathname()).toBe(`/${game.id}`);
      expect(screen.getByRole('link', { name: 'Campaign' })).toBeInTheDocument();
      expect(screen.getByText('Stage: Setup')).toBeInTheDocument();
    });

    it('lists games sorted by title', async () => {
      const user = await renderApp();
      await createGameViaUi(user, 'Zeta');
      await createGameViaUi(user, 'Alpha');
      const titles = within(screen.getByRole('navigation'))
        .getAllByRole('link')
        .map((l) => l.textContent);
      expect(titles).toEqual(['Alpha', 'Zeta']);
    });

    it('shows a blank title as "Untitled game"', async () => {
      seedGame('g1', '');
      await renderApp('/g1');
      expect(screen.getByRole('link', { name: 'Untitled game' })).toBeInTheDocument();
    });

    it('switches between games without showing stale participants', async () => {
      seedGame('g1', 'One');
      seedGame('g2', 'Two');
      setGameDetails({ ...createEmptyGameDetails('g1'), players: [makePlayer({ name: 'Only in one' })] });
      const user = await renderApp('/g1');
      expect(screen.getByRole('cell', { name: 'Only in one' })).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Two' }));
      expect(pathname()).toBe('/g2');
      expect(screen.queryByRole('cell', { name: 'Only in one' })).not.toBeInTheDocument();
    });

    it('deletes the open game after confirmation, then goes to the root and drops its details', async () => {
      seedGame('g1', 'Campaign');
      setGameDetails(createEmptyGameDetails('g1'));
      const user = await renderApp('/g1');

      const item = screen.getByRole('link', { name: 'Campaign' }).closest('li');
      await user.click(within(item as HTMLElement).getByRole('button'));
      const modal = within(getModal(screen.getByText('Are you sure you want to delete Campaign?')));
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(getGamesList()).toEqual([]);
      expect(localStorage.getItem('dnd_fo_game_details__g1')).toBeNull();
      expect(pathname()).toBe('/');
      expect(screen.getByText(HINT)).toBeInTheDocument();
    });

    it('keeps the open game when another one is deleted', async () => {
      seedGame('g1', 'Open');
      seedGame('g2', 'Other');
      const user = await renderApp('/g1');

      const item = screen.getByRole('link', { name: 'Other' }).closest('li');
      await user.click(within(item as HTMLElement).getByRole('button'));
      const modal = within(getModal(screen.getByText('Are you sure you want to delete Other?')));
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(getGamesList().map((g) => g.id)).toEqual(['g1']);
      expect(pathname()).toBe('/g1');
    });

    it('keeps the game when deletion is cancelled', async () => {
      seedGame('g1', 'Campaign');
      const user = await renderApp('/g1');

      const item = screen.getByRole('link', { name: 'Campaign' }).closest('li');
      await user.click(within(item as HTMLElement).getByRole('button'));
      const modal = within(getModal(screen.getByText('Are you sure you want to delete Campaign?')));
      await user.click(modal.getByRole('button', { name: 'Cancel' }));

      expect(getGamesList()).toHaveLength(1);
      expect(pathname()).toBe('/g1');
    });
  });

  describe('playing a game', () => {
    it('saves participants to storage as they are added', async () => {
      seedGame('g1', 'Campaign');
      const user = await renderApp('/g1');
      await addParticipant(user, 'Add Player', 'Hero', '15');

      expect(screen.getByRole('cell', { name: 'Hero' })).toBeInTheDocument();
      expect(getGameDetails('g1').players.map((p) => p.name)).toEqual(['Hero']);
    });

    it('blocks the start of the combat and shows the reason as a toast', async () => {
      seedGame('g1', 'Campaign');
      const user = await renderApp('/g1');
      await user.click(screen.getByRole('button', { name: 'Start Combat' }));

      expect(await screen.findByText(/at least one participant/)).toBeInTheDocument();
      expect(getGameDetails('g1').status).toBe(GameStatus.Setup);
    });

    it('runs a whole combat: start, turns, a new round, pause, finish', async () => {
      seedGame('g1', 'Campaign');
      const user = await renderApp('/g1');
      await addParticipant(user, 'Add Player', 'Hero', '15');
      await addParticipant(user, 'Add Enemy', 'Orc', '8');

      await user.click(screen.getByRole('button', { name: 'Start Combat' }));
      expect(screen.getByText('Stage: Combat, Round: 1')).toBeInTheDocument();
      expect(getGameDetails('g1').status).toBe(GameStatus.Combat);
      expect(getGameDetails('g1').players[0].order).toBe(1);

      await user.click(screen.getByRole('button', { name: 'Next Player' }));
      expect(screen.getByText('Stage: Combat, Round: 1')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Next Player' }));
      expect(screen.getByText('Stage: Combat, Round: 2')).toBeInTheDocument();

      const heroRow = screen.getByRole('cell', { name: 'Hero' }).closest('tr') as HTMLElement;
      await user.click(within(heroRow).getByRole('button'));
      expect(getGameDetails('g1').players[0].status).toBe(PlayerStatus.Paused);

      await user.click(screen.getByRole('button', { name: 'Finish Combat' }));
      const modal = within(getModal(screen.getByRole('heading', { name: 'Finish combat?' })));
      await user.click(modal.getByRole('button', { name: 'Finish' }));

      expect(screen.getByText('Stage: Setup')).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: 'Orc' })).not.toBeInTheDocument();
      expect(getGameDetails('g1')).toMatchObject({ status: GameStatus.Setup, round: 1, enemies: [] });
    });

    it('restores the combat after a reload', async () => {
      seedGame('g1', 'Campaign');
      const user = await renderApp('/g1');
      await addParticipant(user, 'Add Player', 'Hero', '15');
      await user.click(screen.getByRole('button', { name: 'Start Combat' }));
      await user.click(screen.getByRole('button', { name: 'Next Player' }));
      expect(screen.getByText('Stage: Combat, Round: 2')).toBeInTheDocument();

      cleanup();
      await renderApp('/g1');
      expect(screen.getByText('Stage: Combat, Round: 2')).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Hero' })).toBeInTheDocument();
    });
  });
});
