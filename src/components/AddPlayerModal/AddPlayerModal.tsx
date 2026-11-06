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

/** Remounted for every opening (see `key`), so the form starts with the default name already selected. */
export function AddPlayerModal(props: IAddPlayerModalProps): React.ReactElement {
  return <AddPlayerForm key={props.playerType ?? 'closed'} {...props} />;
}

function AddPlayerForm({
  playerType,
  onCloseModal,
  onConfirmModal: onConfirmModalAction,
}: IAddPlayerModalProps): React.ReactElement {
  const config = playerType === null ? undefined : MODAL_CONFIG[playerType];
  const isOpen = playerType !== null;
  const [name, setName] = React.useState<string>(config?.defaultName ?? '');
  const [maxHp, setMaxHp] = React.useState<string>('1');
  const [hp, setHp] = React.useState<string>('');
  const [hpTouched, setHpTouched] = React.useState<boolean>(false);
  const [dex, setDex] = React.useState<string>('');
  const [initiative, setInitiative] = React.useState<string>('');
  const nameRef = useRef<HTMLInputElement>(null);

  const resetForm = (): void => {
    setName(config?.defaultName ?? '');
    setMaxHp('1');
    setHp('');
    setHpTouched(false);
    setDex('');
    setInitiative('');
  };

  useEffect(() => {
    if (isOpen) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [isOpen]);

  const onConfirmModal = (): void => {
    if (playerType === null) {
      return;
    }

    const parsedMaxHp = Math.max(1, parseNumberInput(maxHp, { integer: true }) ?? 1);
    const parsedHp = hpTouched ? (parseNumberInput(hp, { integer: true }) ?? parsedMaxHp) : parsedMaxHp;

    onConfirmModalAction({
      name,
      maxHp: parsedMaxHp,
      hp: Math.min(Math.max(parsedHp, 0), parsedMaxHp),
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
          name="maxHp"
          label="Max HP"
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          value={maxHp}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setMaxHp(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
        <Input
          name="hp"
          label="Current HP"
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          value={hpTouched ? hp : maxHp}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setHpTouched(true);
            setHp(e.currentTarget.value);
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
