import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button/Button';

describe('Button', () => {
  it('renders a native button with the btn class and children', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('btn');
  });

  it('adds extra classes alongside btn', () => {
    render(<Button className="extra">Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.className).toContain('btn');
    expect(button.className).toContain('extra');
  });

  it('forwards type and aria attributes', () => {
    render(
      <Button type="button" aria-label="Close">
        X
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('defaults to type="button" and allows overriding it', () => {
    render(
      <>
        <Button>Default</Button>
        <Button type="submit">Submit</Button>
      </>
    );
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
