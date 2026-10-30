import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { CombatStage } from '@/components/CombatStage/CombatStage';
import { getModal, makeDetails, makePlayer } from '@/testUtils';
import { GameStatus, type IGameDetails, type IPlayer, PlayerStatus, PlayerType } from '@/types';
import { updatePlayersOrder } from '@/utils';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn() } }));

const setup = (details: IGameDetails) => {
  const updateGameDetails = vi.fn<(newDetails: IGameDetails) => void>();
  render(<CombatStage details={details} updateGameDetails={updateGameDetails} />);

  const lastUpdate = (): IGameDetails => {
    const call = updateGameDetails.mock.lastCall;
    if (call === undefined) {
      throw new Error('updateGameDetails was not called');
    }
    return call[0];
  };

  return { updateGameDetails, lastUpdate, user: userEvent.setup() };
};

const rowOf = (name: string): HTMLElement => {
  const row = screen.getByRole('cell', { name }).closest('tr');
  if (row === null) {
    throw new Error(`no row for ${name}`);
  }
  return row;
};

const combat = (): { details: IGameDetails; a: IPlayer; b: IPlayer; c: IPlayer } => {
  const a = makePlayer({ name: 'A', initiative: 30 });
  const b = makePlayer({ name: 'B', initiative: 20 });
  const c = makePlayer({ name: 'C', initiative: 10, type: PlayerType.Enemy });
  return { details: updatePlayersOrder(makeDetails({ players: [a, b], enemies: [c] })), a, b, c };
};

describe('CombatStage', () => {
  describe('table', () => {
    it('lists participants in combat order with their order number', () => {
      const { details } = combat();
      setup(details);
      const rows = screen.getAllByRole('row').slice(1);
      expect(
        rows.map((r) =>
          within(r)
            .getAllByRole('cell')
            .map((c) => c.textContent)
            .slice(0, 4)
        )
      ).toEqual([
        ['A', '30', '--', '1'],
        ['B', '20', '--', '2'],
        ['C', '10', '--', '3'],
      ]);
    });

    it('offers only the pause button, no delete', () => {
      const { details } = combat();
      setup(details);
      expect(within(rowOf('A')).getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('Next Player', () => {
    it('passes the turn to the next participant in order', async () => {
      const { details, b } = combat();
      const { user, lastUpdate } = setup(details);
      await user.click(screen.getByRole('button', { name: 'Next Player' }));

      expect(lastUpdate().currentPlayerId).toBe(b.id);
      expect(lastUpdate().round).toBe(1);
    });

    it('starts a new round when the turn wraps around', async () => {
      const { details, a, c } = combat();
      const { user, lastUpdate } = setup({ ...details, currentPlayerId: c.id });
      await user.click(screen.getByRole('button', { name: 'Next Player' }));

      expect(lastUpdate().currentPlayerId).toBe(a.id);
      expect(lastUpdate().round).toBe(2);
    });

    it('is blocked with a toast when everyone is paused', async () => {
      const only = makePlayer({ name: 'Only', status: PlayerStatus.Paused });
      const { user, updateGameDetails } = setup(updatePlayersOrder(makeDetails({ players: [only] })));
      const button = screen.getByRole('button', { name: 'Next Player' });
      expect(button).toHaveAttribute('aria-disabled', 'true');

      await user.click(button);
      expect(updateGameDetails).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/paused/));
    });

    it('is enabled while someone is active', () => {
      setup(combat().details);
      expect(screen.getByRole('button', { name: 'Next Player' })).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Finish Combat', () => {
    it('asks for confirmation first', async () => {
      const { user, updateGameDetails } = setup(combat().details);
      await user.click(screen.getByRole('button', { name: 'Finish Combat' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'Finish combat?' })).toBeInTheDocument();
    });

    it('goes back to setup, removes enemies and resets initiative, order, round and turn', async () => {
      const { details } = combat();
      const ally = makePlayer({ name: 'Ally', type: PlayerType.Ally, initiative: 8, dex: 2 });
      const { user, lastUpdate } = setup(updatePlayersOrder({ ...details, allies: [ally], round: 4 }));
      await user.click(screen.getByRole('button', { name: 'Finish Combat' }));
      const modal = within(getModal(screen.getByRole('heading', { name: 'Finish combat?' })));
      await user.click(modal.getByRole('button', { name: 'Finish' }));

      const result = lastUpdate();
      expect(result.status).toBe(GameStatus.Setup);
      expect(result.enemies).toEqual([]);
      expect(result.round).toBe(1);
      expect(result.currentPlayerId).toBeUndefined();
      expect([...result.players, ...result.allies].map((p) => [p.initiative, p.order])).toEqual([
        [null, undefined],
        [null, undefined],
        [null, undefined],
      ]);
      expect(result.allies[0]).toMatchObject({ name: 'Ally', dex: 2 });
    });

    it('keeps the combat on Cancel', async () => {
      const { user, updateGameDetails } = setup(combat().details);
      await user.click(screen.getByRole('button', { name: 'Finish Combat' }));
      const modal = within(getModal(screen.getByRole('heading', { name: 'Finish combat?' })));
      await user.click(modal.getByRole('button', { name: 'Cancel' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
    });
  });

  describe('pausing', () => {
    it('pauses the current participant and passes the turn on', async () => {
      const { details, a, b } = combat();
      const { user, lastUpdate } = setup(details);
      await user.click(within(rowOf('A')).getByRole('button'));

      const result = lastUpdate();
      expect(result.players.find((p) => p.id === a.id)?.status).toBe(PlayerStatus.Paused);
      expect(result.currentPlayerId).toBe(b.id);
    });

    it('unpauses a participant that has an initiative', async () => {
      const { details, b } = combat();
      const paused = makePlayer({ name: 'Napper', initiative: 25, status: PlayerStatus.Paused });
      const { user, lastUpdate } = setup(updatePlayersOrder({ ...details, players: [...details.players, paused] }));
      await user.click(within(rowOf('Napper')).getByRole('button'));

      const result = lastUpdate();
      const napper = result.players.find((p) => p.id === paused.id);
      expect(napper?.status).toBe(PlayerStatus.Active);
      expect(napper?.order).toBe(2);
      expect(result.players.find((p) => p.id === b.id)?.order).toBe(3);
    });

    it('asks for an initiative before unpausing a participant that has none', async () => {
      const { details } = combat();
      const late = makePlayer({ name: 'Late', initiative: null, status: PlayerStatus.Paused });
      const { user, lastUpdate, updateGameDetails } = setup(
        updatePlayersOrder({ ...details, players: [...details.players, late] })
      );
      await user.click(within(rowOf('Late')).getByRole('button'));
      expect(updateGameDetails).not.toHaveBeenCalled();

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Late/ })));
      await user.type(modal.getByLabelText('Initiative'), '25');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      const result = lastUpdate();
      const joined = result.players.find((p) => p.id === late.id);
      expect(joined).toMatchObject({ status: PlayerStatus.Active, initiative: 25, order: 2 });
      expect(result.status).toBe(GameStatus.Combat);
    });

    it('does not unpause when the initiative prompt is cancelled', async () => {
      const { details } = combat();
      const late = makePlayer({ name: 'Late', initiative: null, status: PlayerStatus.Paused });
      const { user, updateGameDetails } = setup(
        updatePlayersOrder({ ...details, players: [...details.players, late] })
      );
      await user.click(within(rowOf('Late')).getByRole('button'));
      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Late/ })));
      await user.click(modal.getByRole('button', { name: 'Cancel' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
    });
  });
});
