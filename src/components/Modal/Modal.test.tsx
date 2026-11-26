import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/Modal/Modal';

const setup = (props: Partial<React.ComponentProps<typeof Modal>> = {}) => {
  const onCloseModal = vi.fn();
  const onConfirmModal = vi.fn();
  render(
    <Modal isOpen title="Title" onCloseModal={onCloseModal} onConfirmModal={onConfirmModal} {...props}>
      <p>Body text</p>
    </Modal>
  );
  return { onCloseModal, onConfirmModal, user: userEvent.setup() };
};

describe('Modal', () => {
  it('renders the title and the children', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('confirms with a Save button by default', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('uses the custom confirm label', () => {
    setup({ confirmLabel: 'Finish' });
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('calls onConfirmModal from the confirm button only', async () => {
    const { user, onConfirmModal, onCloseModal } = setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirmModal).toHaveBeenCalledTimes(1);
    expect(onCloseModal).not.toHaveBeenCalled();
  });

  it('calls onCloseModal from the Cancel button', async () => {
    const { user, onConfirmModal, onCloseModal } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCloseModal).toHaveBeenCalledTimes(1);
    expect(onConfirmModal).not.toHaveBeenCalled();
  });

  it('calls onCloseModal from the close icon in the header', async () => {
    const { user, onCloseModal } = setup();
    const [closeButton] = screen.getAllByRole('button');
    await user.click(closeButton);
    expect(onCloseModal).toHaveBeenCalledTimes(1);
  });
});
