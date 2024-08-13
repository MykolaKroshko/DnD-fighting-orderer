import React, { type FormEvent, useEffect, useRef } from 'react';
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
  const newName =
    status === ModalsStatus.AddPlayer ? 'New Player' : status === ModalsStatus.AddAlly ? 'New Ally' : 'New Enemy';
  const [name, setName] = React.useState<string>(newName);
  const [dex, setDex] = React.useState<number>();
  const [initiative, setInitiative] = React.useState<number>();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameRef.current !== null) {
      nameRef.current?.focus();
    }
  }, [nameRef]);

  return (
    <Modal
      isOpen={[ModalsStatus.AddPlayer, ModalsStatus.AddAlly, ModalsStatus.AddEnemy].includes(status)}
      title={title}
      onCloseModal={() => {
        onCloseModal();
        setName('');
        setDex('' as any);
        setInitiative('' as any);
      }}
      onConfirmModal={() => {
        onConfirmModal({
          id: Math.round(Math.random() * 1_000_000_000),
          name,
          dex,
          initiative,
          type:
            status === ModalsStatus.AddPlayer
              ? PlayerType.Player
              : status === ModalsStatus.AddAlly
                ? PlayerType.Ally
                : PlayerType.Enemy,
        });
        setName('');
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
          value={initiative}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setInitiative(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : undefined);
          }}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          value={dex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setDex(!isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : undefined);
          }}
        />
      </form>
    </Modal>
  );
}
