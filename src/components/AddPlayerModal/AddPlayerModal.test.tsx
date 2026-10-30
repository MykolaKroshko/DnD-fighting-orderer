import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddPlayerModal } from '@/components/AddPlayerModal/AddPlayerModal';
import { PlayerStatus, PlayerType } from '@/types';

const setup = (playerType: PlayerType | null = PlayerType.Player) => {
  const onCloseModal = vi.fn();
  const onConfirmModal = vi.fn();
  const ui = (type: PlayerType | null): React.ReactElement => (
    <AddPlayerModal playerType={type} onCloseModal={onCloseModal} onConfirmModal={onConfirmModal} />
  );
  const { rerender } = render(ui(playerType));
  return {
    onCloseModal,
    onConfirmModal,
    user: userEvent.setup(),
    reopen: (type: PlayerType | null) => rerender(ui(type)),
  };
};

describe('AddPlayerModal', () => {
  it.each([
    [PlayerType.Player, 'Add Player', 'New Player'],
    [PlayerType.Ally, 'Add Ally', 'New Ally'],
    [PlayerType.Enemy, 'Add Enemy', 'New Enemy'],
  ])('shows the title and default name for %s', (type, title, defaultName) => {
    setup(type);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue(defaultName);
  });

  it('has an empty title and does not confirm when no type is given', async () => {
    const { user, onConfirmModal } = setup(null);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirmModal).not.toHaveBeenCalled();
  });

  it('focuses the name field and selects the default name so it can be typed over', async () => {
    const { user } = setup(PlayerType.Ally);
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.keyboard('Buddy');
    expect(screen.getByLabelText('Name')).toHaveValue('Buddy');
  });

  it('selects the default name again when reopened', async () => {
    const { user, reopen } = setup(PlayerType.Player);
    reopen(null);
    reopen(PlayerType.Enemy);
    await user.keyboard('Orc');
    expect(screen.getByLabelText('Name')).toHaveValue('Orc');
  });

  it('confirms the entered data without an id', async () => {
    const { user, onConfirmModal } = setup(PlayerType.Enemy);
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Orc');
    await user.type(screen.getByLabelText('Initiative'), '-2.5');
    await user.type(screen.getByLabelText('Dexterity'), '14');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onConfirmModal).toHaveBeenCalledWith({
      name: 'Orc',
      initiative: -2.5,
      dex: 14,
      type: PlayerType.Enemy,
      status: PlayerStatus.Active,
      order: undefined,
    });
  });

  it('turns empty numbers into null', async () => {
    const { user, onConfirmModal } = setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirmModal).toHaveBeenCalledWith(expect.objectContaining({ initiative: null, dex: null }));
  });

  it('rejects a decimal dexterity but accepts a decimal initiative', async () => {
    const { user, onConfirmModal } = setup();
    await user.type(screen.getByLabelText('Initiative'), '7.25');
    await user.type(screen.getByLabelText('Dexterity'), '2.5');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onConfirmModal).toHaveBeenCalledWith(expect.objectContaining({ initiative: 7.25, dex: null }));
  });

  it('keeps a blank name as typed', async () => {
    const { user, onConfirmModal } = setup();
    await user.clear(screen.getByLabelText('Name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirmModal).toHaveBeenCalledWith(expect.objectContaining({ name: '' }));
  });

  it('confirms with Enter from any field', async () => {
    const { user, onConfirmModal } = setup();
    await user.type(screen.getByLabelText('Dexterity'), '5{Enter}');
    expect(onConfirmModal).toHaveBeenCalledTimes(1);
    expect(onConfirmModal).toHaveBeenCalledWith(expect.objectContaining({ dex: 5 }));
  });

  it('resets the form after confirming', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Initiative'), '9');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByLabelText('Initiative')).toHaveValue(null);
    expect(screen.getByLabelText('Name')).toHaveValue('New Player');
  });

  it('closes on Cancel and resets the form', async () => {
    const { user, onCloseModal, onConfirmModal } = setup();
    await user.type(screen.getByLabelText('Dexterity'), '9');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCloseModal).toHaveBeenCalledTimes(1);
    expect(onConfirmModal).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Dexterity')).toHaveValue(null);
  });

  it('starts fresh with the matching default name when reopened for another type', () => {
    const { reopen } = setup(PlayerType.Player);
    reopen(null);
    reopen(PlayerType.Enemy);
    expect(screen.getByLabelText('Name')).toHaveValue('New Enemy');
  });
});
