import { type BoundFunctions, type queries, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { SetupStage } from '@/components/SetupStage/SetupStage';
import { getModal, makeDetails, makePlayer } from '@/testUtils';
import { GameStatus, type IGameDetails, PlayerStatus, PlayerType } from '@/types';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn() } }));

const setup = (details: IGameDetails) => {
  const updateGameDetails = vi.fn<(newDetails: IGameDetails) => void>();
  render(<SetupStage details={details} updateGameDetails={updateGameDetails} />);

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

describe('SetupStage', () => {
  describe('table', () => {
    it('lists players, allies and enemies', () => {
      setup(
        makeDetails({
          players: [makePlayer({ name: 'Hero' })],
          allies: [makePlayer({ name: 'Buddy', type: PlayerType.Ally })],
          enemies: [makePlayer({ name: 'Orc', type: PlayerType.Enemy })],
        })
      );
      expect(
        screen
          .getAllByRole('row')
          .slice(1)
          .map((r) => within(r).getAllByRole('cell')[0].textContent)
      ).toEqual(['Hero', 'Buddy', 'Orc']);
    });

    it('offers HP, pause and delete for every participant', () => {
      setup(makeDetails({ players: [makePlayer({ name: 'Hero' })] }));
      expect(within(rowOf('Hero')).getAllByRole('button')).toHaveLength(3);
    });
  });

  describe('hit points', () => {
    const heroDetails = (): IGameDetails => makeDetails({ players: [makePlayer({ name: 'Hero', maxHp: 20, hp: 12 })] });
    const openHpModal = async (user: ReturnType<typeof userEvent.setup>): Promise<BoundFunctions<typeof queries>> => {
      await user.click(within(rowOf('Hero')).getByRole('button', { name: '12/20' }));
      return within(getModal(screen.getByRole('heading', { name: 'Hero: 12/20 HP' })));
    };

    it('opens the HP modal from the HP cell', async () => {
      const { user } = setup(heroDetails());
      const modal = await openHpModal(user);
      expect(modal.getByLabelText('Amount')).toBeInTheDocument();
    });

    it('damages the participant and closes the modal', async () => {
      const { user, lastUpdate } = setup(heroDetails());
      const modal = await openHpModal(user);
      expect(document.querySelector('.open')).not.toBeNull();
      await user.type(modal.getByLabelText('Amount'), '5');
      await user.click(modal.getAllByRole('button', { name: 'Damage' })[0]);
      expect(lastUpdate().players[0].hp).toBe(7);
      expect(document.querySelector('.open')).toBeNull();
    });
  });

  describe('adding participants', () => {
    it.each([
      ['Add Player', 'New Player', PlayerType.Player, 'players'],
      ['Add Ally', 'New Ally', PlayerType.Ally, 'allies'],
      ['Add Enemy', 'New Enemy', PlayerType.Enemy, 'enemies'],
    ] as const)(
      '%s opens a modal with a default name and saves to the right list',
      async (button, defaultName, type, key) => {
        const { user, lastUpdate } = setup(makeDetails({}));
        await user.click(screen.getByRole('button', { name: button }));

        const modal = within(getModal(screen.getByRole('heading', { name: button })));
        expect(modal.getByLabelText('Name')).toHaveValue(defaultName);

        await user.click(modal.getByRole('button', { name: 'Save' }));
        const saved = lastUpdate()[key];
        expect(saved).toHaveLength(1);
        expect(saved[0]).toMatchObject({
          name: defaultName,
          type,
          status: PlayerStatus.Active,
          initiative: null,
          dex: null,
        });
        expect(typeof saved[0].id).toBe('string');
      }
    );

    it('saves the entered values, with decimal initiative', async () => {
      const { user, lastUpdate } = setup(makeDetails({}));
      await user.click(screen.getByRole('button', { name: 'Add Player' }));

      const modal = within(getModal(screen.getByRole('heading', { name: 'Add Player' })));
      await user.clear(modal.getByLabelText('Name'));
      await user.type(modal.getByLabelText('Name'), 'Hero');
      await user.type(modal.getByLabelText('Initiative'), '15.5');
      await user.type(modal.getByLabelText('Dexterity'), '3');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(lastUpdate().players[0]).toMatchObject({ name: 'Hero', initiative: 15.5, dex: 3 });
    });

    it('saves with Enter', async () => {
      const { user, lastUpdate } = setup(makeDetails({}));
      await user.click(screen.getByRole('button', { name: 'Add Enemy' }));

      const modal = within(getModal(screen.getByRole('heading', { name: 'Add Enemy' })));
      await user.clear(modal.getByLabelText('Name'));
      await user.type(modal.getByLabelText('Name'), 'Goblin{Enter}');

      expect(lastUpdate().enemies.map((p) => p.name)).toEqual(['Goblin']);
    });

    it('keeps the list sorted by name', async () => {
      const { user, lastUpdate } = setup(makeDetails({ players: [makePlayer({ name: 'Zed' })] }));
      await user.click(screen.getByRole('button', { name: 'Add Player' }));

      const modal = within(getModal(screen.getByRole('heading', { name: 'Add Player' })));
      await user.clear(modal.getByLabelText('Name'));
      await user.type(modal.getByLabelText('Name'), 'Amy');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(lastUpdate().players.map((p) => p.name)).toEqual(['Amy', 'Zed']);
    });

    it('keeps the other participants untouched', async () => {
      const orc = makePlayer({ name: 'Orc', type: PlayerType.Enemy });
      const { user, lastUpdate } = setup(makeDetails({ enemies: [orc] }));
      await user.click(screen.getByRole('button', { name: 'Add Player' }));
      await user.click(
        within(getModal(screen.getByRole('heading', { name: 'Add Player' }))).getByRole('button', { name: 'Save' })
      );

      expect(lastUpdate().enemies).toEqual([orc]);
    });

    it('does not save on Cancel', async () => {
      const { user, updateGameDetails } = setup(makeDetails({}));
      await user.click(screen.getByRole('button', { name: 'Add Player' }));
      await user.click(
        within(getModal(screen.getByRole('heading', { name: 'Add Player' }))).getByRole('button', { name: 'Cancel' })
      );

      expect(updateGameDetails).not.toHaveBeenCalled();
    });
  });

  describe('starting combat', () => {
    it('is blocked and explained with a toast when there are no participants', async () => {
      const { user, updateGameDetails } = setup(makeDetails({}));
      const button = screen.getByRole('button', { name: 'Start Combat' });
      expect(button).toHaveAttribute('aria-disabled', 'true');

      await user.click(button);
      expect(updateGameDetails).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/at least one participant/));
    });

    it('is blocked and names who is missing an initiative', async () => {
      const { user, updateGameDetails } = setup(
        makeDetails({
          players: [makePlayer({ name: 'Anna', initiative: null }), makePlayer({ name: 'Bob', initiative: 3 })],
        })
      );
      await user.click(screen.getByRole('button', { name: 'Start Combat' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Anna'));
      expect(toast.info).toHaveBeenCalledWith(expect.not.stringContaining('Bob'));
    });

    it('shows the reason as a tooltip while blocked', () => {
      setup(makeDetails({}));
      expect(screen.getByRole('button', { name: 'Start Combat' })).toHaveAttribute(
        'title',
        expect.stringMatching(/participant/)
      );
    });

    it('starts the combat in initiative order when every active participant has an initiative', async () => {
      const slow = makePlayer({ name: 'Slow', initiative: 5 });
      const fast = makePlayer({ name: 'Fast', initiative: 18 });
      const { user, lastUpdate } = setup(makeDetails({ players: [slow, fast] }));
      const button = screen.getByRole('button', { name: 'Start Combat' });
      expect(button).toHaveAttribute('aria-disabled', 'false');

      await user.click(button);
      const result = lastUpdate();
      expect(result.status).toBe(GameStatus.Combat);
      expect(result.currentPlayerId).toBe(fast.id);
      expect(result.players.find((p) => p.id === fast.id)?.order).toBe(1);
      expect(result.players.find((p) => p.id === slow.id)?.order).toBe(2);
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('pausing', () => {
    it('toggles the status and stays in setup', async () => {
      const hero = makePlayer({ name: 'Hero', initiative: null });
      const { user, lastUpdate } = setup(makeDetails({ players: [hero] }));
      await user.click(within(rowOf('Hero')).getAllByRole('button')[1]);

      const result = lastUpdate();
      expect(result.status).toBe(GameStatus.Setup);
      expect(result.players[0].status).toBe(PlayerStatus.Paused);
    });

    it('lets combat start when the only participant without initiative is paused', async () => {
      const { user, lastUpdate } = setup(
        makeDetails({
          players: [
            makePlayer({ name: 'Hero', initiative: 4 }),
            makePlayer({ name: 'Idle', initiative: null, status: PlayerStatus.Paused }),
          ],
        })
      );
      await user.click(screen.getByRole('button', { name: 'Start Combat' }));
      expect(lastUpdate().status).toBe(GameStatus.Combat);
    });
  });

  describe('deleting', () => {
    it('asks for confirmation and then removes only that participant', async () => {
      const hero = makePlayer({ name: 'Hero' });
      const other = makePlayer({ name: 'Other' });
      const { user, lastUpdate, updateGameDetails } = setup(makeDetails({ players: [hero, other] }));
      await user.click(within(rowOf('Hero')).getAllByRole('button')[2]);
      expect(updateGameDetails).not.toHaveBeenCalled();

      const modal = within(getModal(screen.getByText('Are you sure you want to delete Hero?')));
      await user.click(modal.getByRole('button', { name: 'Save' }));
      expect(lastUpdate().players).toEqual([other]);
    });

    it('uses the "Unnamed" fallback in the confirmation text', async () => {
      const { user } = setup(makeDetails({ players: [makePlayer({ name: '' })] }));
      await user.click(screen.getAllByRole('button', { name: '' })[1]);
      expect(screen.getByText('Are you sure you want to delete Unnamed?')).toBeInTheDocument();
    });

    it('keeps the participant on Cancel', async () => {
      const { user, updateGameDetails } = setup(makeDetails({ players: [makePlayer({ name: 'Hero' })] }));
      await user.click(within(rowOf('Hero')).getAllByRole('button')[2]);
      const modal = within(getModal(screen.getByText('Are you sure you want to delete Hero?')));
      await user.click(modal.getByRole('button', { name: 'Cancel' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
    });
  });

  describe('editing', () => {
    it('opens a prefilled modal when the name is clicked and saves the changes in place', async () => {
      const first = makePlayer({ name: 'Aaa' });
      const hero = makePlayer({ name: 'Hero', initiative: 12, dex: 3 });
      const { user, lastUpdate } = setup(makeDetails({ players: [first, hero] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      expect(modal.getByLabelText('Name')).toHaveValue('Hero');
      expect(modal.getByLabelText('Initiative')).toHaveValue(12);
      expect(modal.getByLabelText('Dexterity')).toHaveValue(3);

      await user.clear(modal.getByLabelText('Initiative'));
      await user.type(modal.getByLabelText('Initiative'), '-1.5');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      const result = lastUpdate();
      expect(result.players.map((p) => p.name)).toEqual(['Aaa', 'Hero']);
      expect(result.players[1]).toMatchObject({ id: hero.id, initiative: -1.5, dex: 3, name: 'Hero' });
      expect(result.players[0]).toEqual(first);
    });

    it('focuses the initiative field and selects its value', async () => {
      const { user } = setup(makeDetails({ players: [makePlayer({ name: 'Hero', initiative: 12 })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      expect(modal.getByLabelText('Initiative')).toHaveFocus();
      await user.keyboard('9');
      expect(modal.getByLabelText('Initiative')).toHaveValue(9);
    });

    it('clears an initiative left empty', async () => {
      const { user, lastUpdate } = setup(makeDetails({ players: [makePlayer({ name: 'Hero', initiative: 12 })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      await user.clear(modal.getByLabelText('Initiative'));
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(lastUpdate().players[0].initiative).toBeNull();
    });

    it('edits Max HP and Current HP, prefilled, with Max HP first', async () => {
      const { user, lastUpdate } = setup(makeDetails({ players: [makePlayer({ name: 'Hero', maxHp: 20, hp: 12 })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      const labels = modal.getAllByText(/HP$/).map((el) => el.textContent);
      expect(labels).toEqual(['Max HP', 'Current HP']);
      expect(modal.getByLabelText('Max HP')).toHaveValue(20);
      expect(modal.getByLabelText('Current HP')).toHaveValue(12);

      await user.clear(modal.getByLabelText('Max HP'));
      await user.type(modal.getByLabelText('Max HP'), '30');
      await user.clear(modal.getByLabelText('Current HP'));
      await user.type(modal.getByLabelText('Current HP'), '25');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(lastUpdate().players[0]).toMatchObject({ maxHp: 30, hp: 25 });
    });

    it('does not fill Current HP from Max HP while editing', async () => {
      const { user } = setup(makeDetails({ players: [makePlayer({ name: 'Hero', maxHp: 20, hp: 12 })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      await user.clear(modal.getByLabelText('Max HP'));
      await user.type(modal.getByLabelText('Max HP'), '30');
      expect(modal.getByLabelText('Current HP')).toHaveValue(12);
    });

    it('caps Current HP at Max HP on save', async () => {
      const { user, lastUpdate } = setup(makeDetails({ players: [makePlayer({ name: 'Hero', maxHp: 20, hp: 12 })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));

      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      await user.clear(modal.getByLabelText('Max HP'));
      await user.type(modal.getByLabelText('Max HP'), '8');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(lastUpdate().players[0]).toMatchObject({ maxHp: 8, hp: 8 });
    });

    it('does not save on Cancel', async () => {
      const { user, updateGameDetails } = setup(makeDetails({ players: [makePlayer({ name: 'Hero' })] }));
      await user.click(screen.getByRole('cell', { name: 'Hero' }));
      const modal = within(getModal(screen.getByRole('heading', { name: /^Change Hero/ })));
      await user.click(modal.getByRole('button', { name: 'Cancel' }));

      expect(updateGameDetails).not.toHaveBeenCalled();
    });
  });
});
