import { type BoundFunctions, type queries, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { HpModal } from '@/components/HpModal/HpModal';
import { getModal, makeDetails, makePlayer } from '@/testUtils';
import { type IGameDetails } from '@/types';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn() } }));

const hero = makePlayer({ name: 'Hero', maxHp: 20, hp: 12 });

const setup = (playerId: string | null = hero.id) => {
  const details = makeDetails({ players: [hero] });
  const onUpdate = vi.fn<(details: IGameDetails) => void>();
  const onClose = vi.fn();
  render(<HpModal playerId={playerId} details={details} onUpdate={onUpdate} onClose={onClose} />);

  const lastHp = (): number => {
    const call = onUpdate.mock.lastCall;
    if (call === undefined) {
      throw new Error('onUpdate was not called');
    }
    return call[0].players[0].hp;
  };

  const modal = (): BoundFunctions<typeof queries> => within(getModal(screen.getByLabelText('Amount')));
  return { onUpdate, onClose, lastHp, modal, user: userEvent.setup() };
};

describe('HpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the participant and their current HP in the title', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Hero: 12/20 HP' })).toBeInTheDocument();
  });

  it('is closed without a participant', () => {
    setup(null);
    expect(document.querySelector('.open')).toBeNull();
  });

  it('Damage lowers HP and closes', async () => {
    const { user, modal, lastHp, onClose } = setup();
    await user.type(screen.getByLabelText('Amount'), '5');
    await user.click(modal().getAllByRole('button', { name: 'Damage' })[0]);
    expect(lastHp()).toBe(7);
    expect(onClose).toHaveBeenCalled();
  });

  it('the footer confirm button also applies Damage', async () => {
    const { user, modal, lastHp, onClose } = setup();
    await user.type(screen.getByLabelText('Amount'), '3');
    await user.click(modal().getAllByRole('button', { name: 'Damage' }).at(-1) as HTMLElement);
    expect(lastHp()).toBe(9);
    expect(onClose).toHaveBeenCalled();
  });

  it('Enter applies Damage', async () => {
    const { user, lastHp, onClose } = setup();
    await user.type(screen.getByLabelText('Amount'), '4{Enter}');
    expect(lastHp()).toBe(8);
    expect(onClose).toHaveBeenCalled();
  });

  it('Heal raises HP up to the maximum and closes', async () => {
    const { user, modal, lastHp, onClose } = setup();
    await user.type(screen.getByLabelText('Amount'), '99');
    await user.click(modal().getByRole('button', { name: 'Heal' }));
    expect(lastHp()).toBe(20);
    expect(onClose).toHaveBeenCalled();
  });

  it('Restore sets HP to the maximum without an amount', async () => {
    const { user, modal, lastHp, onClose } = setup();
    await user.click(modal().getByRole('button', { name: 'Restore to Max' }));
    expect(lastHp()).toBe(20);
    expect(onClose).toHaveBeenCalled();
  });

  it.each(['', '0', '-3', '2.5'])('rejects the amount "%s" with a toast and changes nothing', async (amount) => {
    const { user, modal, onUpdate, onClose } = setup();
    if (amount !== '') {
      await user.type(screen.getByLabelText('Amount'), amount);
    }
    await user.click(modal().getAllByRole('button', { name: 'Damage' })[0]);
    await user.click(modal().getByRole('button', { name: 'Heal' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('Enter a whole number of 1 or more');
  });

  it('Cancel closes without changes', async () => {
    const { user, modal, onUpdate, onClose } = setup();
    await user.click(modal().getByRole('button', { name: 'Cancel' }));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
