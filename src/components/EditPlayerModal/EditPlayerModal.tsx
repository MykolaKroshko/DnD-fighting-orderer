import React, { type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { type IPlayer } from '@/types';

interface IAddPlayerModalProps {
  currentPlayer: IPlayer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newPlayer: IPlayer) => void;
}

export function EditPlayerModal({
  currentPlayer,
  isOpen,
  onClose,
  onConfirm,
}: IAddPlayerModalProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pDex, setPDex] = React.useState<number>(currentPlayer?.dex ?? ('' as any));
  const [pInitiative, setPInitiative] = React.useState<number>(currentPlayer?.initiative ?? ('' as any));

  useEffect(() => {
    if (isOpen) {
      setPInitiative(currentPlayer?.initiative ?? ('' as any));
      setPDex(currentPlayer?.dex ?? ('' as any));
    }
  }, [isOpen, currentPlayer]);

  useEffect(() => {
    if (inputRef.current !== null && isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [inputRef, isOpen]);

  const clearInputs = (): void => {
    setPDex('' as any);
    setPInitiative('' as any);
  };

  const onConfirmModal = (): void => {
    onConfirm({
      ...currentPlayer,
      initiative: pInitiative ?? null,
      dex: pDex ?? null,
    });
    clearInputs();
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseModal={() => {
        onClose();
        clearInputs();
      }}
      title={`Change ${currentPlayer?.name}'s details`}
      onConfirmModal={onConfirmModal}
    >
      <form>
        <Input
          inputRef={inputRef}
          name="initiative"
          label="Initiative"
          type="number"
          inputMode="numeric"
          value={pInitiative}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPInitiative(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : ('' as any));
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onConfirmModal();
            }
          }}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          inputMode="numeric"
          value={pDex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPDex(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : ('' as any));
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
