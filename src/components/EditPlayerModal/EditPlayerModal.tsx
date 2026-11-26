import React, { type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { setPlayerHp } from '@/hp';
import { type IPlayer } from '@/types';
import { getPlayerName, parseNumberInput } from '@/utils';

interface IEditPlayerModalProps {
  currentPlayer: IPlayer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newPlayer: IPlayer) => void;
}

const toInputValue = (value: number | null): string => (value === null ? '' : String(value));

export function EditPlayerModal({
  currentPlayer,
  isOpen,
  onClose,
  onConfirm,
}: IEditPlayerModalProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pName, setPName] = React.useState<string>(() => currentPlayer.name);
  const [pMaxHp, setPMaxHp] = React.useState<string>(() => String(currentPlayer.maxHp));
  const [pHp, setPHp] = React.useState<string>(() => String(currentPlayer.hp));
  const [pDex, setPDex] = React.useState<string>(() => toInputValue(currentPlayer.dex));
  const [pInitiative, setPInitiative] = React.useState<string>(() => toInputValue(currentPlayer.initiative));

  useEffect(() => {
    if (isOpen) {
      setPName(currentPlayer.name);
      setPInitiative(toInputValue(currentPlayer.initiative));
      setPDex(toInputValue(currentPlayer.dex));
      setPMaxHp(String(currentPlayer.maxHp));
      setPHp(String(currentPlayer.hp));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isOpen, currentPlayer]);

  const clearInputs = (): void => {
    setPName('');
    setPDex('');
    setPInitiative('');
    setPMaxHp('');
    setPHp('');
  };

  const onConfirmModal = (): void => {
    const maxHp = parseNumberInput(pMaxHp, { integer: true }) ?? 1;
    const hp = parseNumberInput(pHp, { integer: true }) ?? maxHp;

    onConfirm({
      ...setPlayerHp(currentPlayer, { maxHp, hp }),
      name: pName,
      initiative: parseNumberInput(pInitiative, { integer: false }),
      dex: parseNumberInput(pDex, { integer: true }),
    });
    clearInputs();
  };

  const onEnter = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      onConfirmModal();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseModal={() => {
        onClose();
        clearInputs();
      }}
      title={`Change ${getPlayerName(currentPlayer.name)}'s details`}
      onConfirmModal={onConfirmModal}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          name="name"
          label="Name"
          value={pName}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPName(e.currentTarget.value);
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
          value={pMaxHp}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPMaxHp(e.currentTarget.value);
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
          value={pHp}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPHp(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
        <Input
          inputRef={inputRef}
          name="initiative"
          label="Initiative"
          type="number"
          step="any"
          inputMode="decimal"
          value={pInitiative}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPInitiative(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          step="1"
          inputMode="numeric"
          value={pDex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setPDex(e.currentTarget.value);
          }}
          onKeyPress={onEnter}
        />
      </form>
    </Modal>
  );
}
