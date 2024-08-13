import React, { type FormEvent, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { ModalsStatus } from '@/components/SetupStage/SetupStage';
import { type IPlayer, PlayerType } from '@/types';

interface IAddPlayerModalProps {
  status: ModalsStatus;
  onCloseModal: () => void;
  onConfirmModal: (data: IPlayer) => void;
}

export function AddPlayerModal({ status, onCloseModal, onConfirmModal }: IAddPlayerModalProps): React.ReactElement {
  const title =
    status === ModalsStatus.AddPlayer ? 'Add Player' : status === ModalsStatus.AddAlly ? 'Add Ally' : 'Add Enemy';
  const [name, setName] = React.useState<string>('');
  const [dex, setDex] = React.useState<number>('' as any);
  const [initiative, setInitiative] = React.useState<number>('' as any);
  const nameRef = useRef<HTMLInputElement>(null);

  const newName = useMemo(() => {
    const newName =
      status === ModalsStatus.AddPlayer ? 'New Player' : status === ModalsStatus.AddAlly ? 'New Ally' : 'New Enemy';
    setName(newName);
    return newName;
  }, [status]);

  useEffect(() => {
    if (
      nameRef.current !== null &&
      [ModalsStatus.AddPlayer, ModalsStatus.AddAlly, ModalsStatus.AddEnemy].includes(status)
    ) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [nameRef, status]);

  return (
    <Modal
      isOpen={[ModalsStatus.AddPlayer, ModalsStatus.AddAlly, ModalsStatus.AddEnemy].includes(status)}
      title={title}
      onCloseModal={() => {
        onCloseModal();
        setName(newName);
        setDex('' as any);
        setInitiative('' as any);
      }}
      onConfirmModal={() => {
        onConfirmModal({
          id: Math.round(Math.random() * 1_000_000_000),
          name,
          dex: dex ?? null,
          initiative: initiative ?? null,
          type:
            status === ModalsStatus.AddPlayer
              ? PlayerType.Player
              : status === ModalsStatus.AddAlly
                ? PlayerType.Ally
                : PlayerType.Enemy,
        });
        setName(newName);
        setDex('' as any);
        setInitiative('' as any);
      }}
    >
      <form>
        <Input
          inputRef={nameRef}
          name="name"
          label="Name"
          value={name}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setName(e.currentTarget.value);
          }}
        />
        <Input
          name="initiative"
          label="Initiative"
          type="number"
          inputMode="numeric"
          value={initiative}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setInitiative(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : ('' as any));
          }}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          inputMode="numeric"
          value={dex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setDex(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : ('' as any));
          }}
        />
      </form>
    </Modal>
  );
}
