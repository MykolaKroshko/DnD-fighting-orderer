import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import CloseIcon from '@/assets/icons/close.svg?react';
import { Button } from '@/components/Button/Button';

interface IModalProps {
  children?: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onCloseModal: () => void;
  onConfirmModal?: () => void;
  confirmLabel?: string;
}

export function Modal({
  children,
  isOpen,
  title,
  confirmLabel = 'Save',
  onCloseModal,
  onConfirmModal,
}: IModalProps): React.ReactElement {
  return (
    <div className={clsx(styles.shade, { [styles.open]: isOpen })}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.modal_title}>{title}</h2>
          <Button onClick={onCloseModal} className={styles.close_btn}>
            <CloseIcon className={clsx('icon', styles.close_icon)} />
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <Button onClick={onCloseModal}>Cancel</Button>
          {onConfirmModal && <Button onClick={onConfirmModal}>{confirmLabel}</Button>}
        </footer>
      </div>
    </div>
  );
}
