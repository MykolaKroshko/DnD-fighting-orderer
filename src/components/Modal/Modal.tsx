import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import CloseIcon from '@/assets/icons/close.svg?react';

interface IModalProps {
  children?: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onCloseModal: () => void;
  onConfirmModal: () => void;
}

export function Modal({ children, isOpen, title, onCloseModal, onConfirmModal }: IModalProps): React.ReactElement {
  return (
    <div className={clsx(styles.shade, { [styles.open]: isOpen })}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.modal_title}>{title}</h2>
          <button type="button" onClick={onCloseModal} className={clsx('btn', styles.close_btn)}>
            <CloseIcon className={clsx('icon', styles.close_icon)} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <button className="btn" onClick={onCloseModal}>
            Cancel
          </button>
          <button className="btn" onClick={onConfirmModal}>
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
