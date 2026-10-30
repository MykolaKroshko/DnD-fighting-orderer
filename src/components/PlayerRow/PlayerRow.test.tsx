import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerRow } from '@/components/PlayerRow/PlayerRow';
import { makePlayer } from '@/testUtils';
import { type IPlayer, PlayerStatus } from '@/types';

const setup = (player: IPlayer, props: Partial<React.ComponentProps<typeof PlayerRow>> = {}) => {
  const onTogglePause = vi.fn();
  render(
    <table>
      <tbody>
        <PlayerRow player={player} onTogglePause={onTogglePause} {...props} />
      </tbody>
    </table>
  );
  return { onTogglePause, user: userEvent.setup(), row: screen.getByRole('row') };
};

const cellTexts = (row: HTMLElement): string[] =>
  within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);

describe('PlayerRow', () => {
  it('shows name, initiative and dex', () => {
    const { row } = setup(makePlayer({ name: 'Hero', initiative: 12.5, dex: 3 }));
    expect(cellTexts(row).slice(0, 3)).toEqual(['Hero', '12.5', '3']);
  });

  it('shows placeholders for missing values and blank names', () => {
    const { row } = setup(makePlayer({ name: '  ', initiative: null, dex: null }));
    expect(cellTexts(row).slice(0, 3)).toEqual(['Unnamed', '--', '--']);
  });

  it('shows initiative and dex of 0, not a placeholder', () => {
    const { row } = setup(makePlayer({ initiative: 0, dex: 0 }));
    expect(cellTexts(row).slice(1, 3)).toEqual(['0', '0']);
  });

  it('shows the order only for active participants during combat', () => {
    const { row } = setup(makePlayer({ order: 2 }), { isCombatStage: true });
    expect(cellTexts(row)[3]).toBe('2');
  });

  it('hides the order during setup', () => {
    const { row } = setup(makePlayer({ order: 2 }), { isCombatStage: false });
    expect(cellTexts(row)[3]).toBe('--');
  });

  it('hides the order of paused participants during combat', () => {
    const { row } = setup(makePlayer({ order: 2, status: PlayerStatus.Paused }), { isCombatStage: true });
    expect(cellTexts(row)[3]).toBe('--');
  });

  it('calls onEdit with the player when the name is clicked', async () => {
    const player = makePlayer({ name: 'Hero' });
    const onEdit = vi.fn();
    const { user } = setup(player, { onEdit });
    await user.click(screen.getByRole('cell', { name: 'Hero' }));
    expect(onEdit).toHaveBeenCalledWith(player);
  });

  it('renders only the pause button without onDelete', () => {
    setup(makePlayer());
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('calls onTogglePause, and not onEdit, when the pause button is clicked', async () => {
    const player = makePlayer();
    const onEdit = vi.fn();
    const { user, onTogglePause } = setup(player, { onEdit, onDelete: vi.fn() });
    await user.click(screen.getAllByRole('button')[0]);
    expect(onTogglePause).toHaveBeenCalledWith(player);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onDelete, and not onEdit, when the delete button is clicked', async () => {
    const player = makePlayer();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { user, onTogglePause } = setup(player, { onEdit, onDelete });
    await user.click(screen.getAllByRole('button')[1]);
    expect(onDelete).toHaveBeenCalledWith(player);
    expect(onTogglePause).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('does nothing when the name is clicked and there is no onEdit', async () => {
    const { user, onTogglePause } = setup(makePlayer({ name: 'Hero' }));
    await user.click(screen.getByRole('cell', { name: 'Hero' }));
    expect(onTogglePause).not.toHaveBeenCalled();
  });
});
