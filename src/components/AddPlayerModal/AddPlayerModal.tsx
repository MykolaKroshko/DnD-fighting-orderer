import React, { type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { type IPlayer, PlayerStatus, PlayerType } from '@/types';
import { parseNumberInput } from '@/utils';

interface IAddPlayerModalProps {
  playerType: PlayerType | null;
  onCloseModal: () => void;
  onConfirmModal: (data: Omit<IPlayer, 'id'>) => void;
}

const MODAL_CONFIG: Record<PlayerType, { title: string; defaultName: string }> = {
  [PlayerType.Player]: { title: 'Add Player', defaultName: 'New Player' },
  [PlayerType.Ally]: { title: 'Add Ally', defaultName: 'New Ally' },
  [PlayerType.Enemy]: { title: 'Add Enemy', defaultName: 'New Enemy' },
};

export function AddPlayerModal({
  playerType,
  onCloseModal,
  onConfirmModal: onConfirmModalAction,
}: IAddPlayerModalProps): React.ReactElement {
  const config = playerType === null ? undefined : MODAL_CONFIG[playerType];
  const isOpen = playerType !== null;
  const [name, setName] = React.useState<string>('');
  const [dex, setDex] = React.useState<string>('');
  const [initiative, setInitiative] = React.useState<string>('');
  const nameRef = useRef<HTMLInputElement>(null);

  const resetForm = (): void => {
    setName(config?.defaultName ?? '');
    setDex('');
    setInitiative('');
  };

  useEffect(() => {
    if (isOpen) {
      setName(playerType === null ? '' : MODAL_CONFIG[playerType].defaultName);
      setDex('');
      setInitiative('');
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [playerType, isOpen]);

  const onConfirmModal = (): void => {
    if (playerType === null) {
      return;
    }

    onConfirmModalAction({
      name,
      dex: parseNumberInput(dex, { integer: true }),
      initiative: parseNumberInput(initiative, { integer: false }),
      type: playerType,
      status: PlayerStatus.Active,
      order: undefined,
    });
    resetForm();
  };

  const onEnter = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      onConfirmModal();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={config?.title}
      onCloseModal={() => {
        onCloseModal();
        resetForm();
      }}
      onConfirmModal={onConfirmModal}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          inputRef={nameRef}
          name="name"
          label="Name"
          value={name}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setName(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
        <Input
          name="initiative"
          label="Initiative"
          type="number"
          step="any"
          inputMode="decimal"
          value={initiative}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setInitiative(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          step="1"
          inputMode="numeric"
          value={dex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setDex(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
      </form>
    </Modal>
  );
}
