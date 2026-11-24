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
    expect([cellTexts(row)[0], ...cellTexts(row).slice(2, 4)]).toEqual(['Hero', '12.5', '3']);
  });

  it('shows placeholders for missing values and blank names', () => {
    const { row } = setup(makePlayer({ name: '  ', initiative: null, dex: null }));
    expect([cellTexts(row)[0], ...cellTexts(row).slice(2, 4)]).toEqual(['Unnamed', '--', '--']);
  });

  it('shows initiative and dex of 0, not a placeholder', () => {
    const { row } = setup(makePlayer({ initiative: 0, dex: 0 }));
    expect(cellTexts(row).slice(2, 4)).toEqual(['0', '0']);
  });

  it('shows the order only for active participants during combat', () => {
    const { row } = setup(makePlayer({ order: 2 }), { isCombatStage: true });
    expect(cellTexts(row)[4]).toBe('2');
  });

  it('hides the order during setup', () => {
    const { row } = setup(makePlayer({ order: 2 }), { isCombatStage: false });
    expect(cellTexts(row)[4]).toBe('--');
  });

  it('hides the order of paused participants during combat', () => {
    const { row } = setup(makePlayer({ order: 2, status: PlayerStatus.Paused }), { isCombatStage: true });
    expect(cellTexts(row)[4]).toBe('--');
  });

  it('shows current and maximum HP', () => {
    const { row } = setup(makePlayer({ maxHp: 20, hp: 12 }));
    expect(cellTexts(row)[1]).toBe('12/20');
  });

  it('marks a participant at 0 HP as down', () => {
    const { row } = setup(makePlayer({ maxHp: 20, hp: 0 }));
    expect(row.className).toContain('down');
  });

  it('does not mark a participant with HP left as down', () => {
    const { row } = setup(makePlayer({ maxHp: 20, hp: 1 }));
    expect(row.className).not.toContain('down');
  });

  it('calls onOpenHp, and not onEdit, when the HP cell is clicked', async () => {
    const player = makePlayer({ maxHp: 20, hp: 12 });
    const onEdit = vi.fn();
    const onOpenHp = vi.fn();
    const { user } = setup(player, { onEdit, onOpenHp });
    await user.click(screen.getByRole('button', { name: '12/20' }));
    expect(onOpenHp).toHaveBeenCalledWith(player);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onEdit with the player when the name is clicked', async () => {
    const player = makePlayer({ name: 'Hero' });
    const onEdit = vi.fn();
    const { user } = setup(player, { onEdit });
    await user.click(screen.getByRole('cell', { name: 'Hero' }));
    expect(onEdit).toHaveBeenCalledWith(player);
  });

  it('renders only the HP and pause buttons without onDelete', () => {
    setup(makePlayer());
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('renders the HP, pause and delete buttons as type="button"', () => {
    setup(makePlayer(), { onDelete: vi.fn() });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('calls onTogglePause, and not onEdit, when the pause button is clicked', async () => {
    const player = makePlayer();
    const onEdit = vi.fn();
    const { user, onTogglePause } = setup(player, { onEdit, onDelete: vi.fn() });
    await user.click(screen.getAllByRole('button')[1]);
    expect(onTogglePause).toHaveBeenCalledWith(player);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onDelete, and not onEdit, when the delete button is clicked', async () => {
    const player = makePlayer();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { user, onTogglePause } = setup(player, { onEdit, onDelete });
    await user.click(screen.getAllByRole('button')[2]);
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
