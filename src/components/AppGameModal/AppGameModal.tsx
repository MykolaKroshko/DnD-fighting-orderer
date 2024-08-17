import React, { type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';

interface IAddGameModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onConfirmModal: () => void;
  formInput: string;
  setFormInput: (value: string) => void;
}

export function AddGameModal({
  isModalOpen,
  onConfirmModal,
  onCloseModal,
  formInput,
  setFormInput,
}: IAddGameModalProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current !== null && isModalOpen) {
      inputRef.current?.focus();
    }
  }, [inputRef, isModalOpen]);

  return (
    <Modal isOpen={isModalOpen} title="Add new game" onCloseModal={onCloseModal} onConfirmModal={onConfirmModal}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          inputRef={inputRef}
          name="gameTitle"
          label="New game title"
          value={formInput}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setFormInput(e.currentTarget.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onConfirmModal();
            }
          }}
        />
      </form>
    </Modal>
  );
}
