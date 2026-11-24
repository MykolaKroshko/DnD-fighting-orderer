import styles from './styles.module.scss';
import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { damagePlayer, findPlayer, getMaxHp, healPlayer, restorePlayer } from '@/hp';
import { type IGameDetails } from '@/types';
import { getPlayerName, parseNumberInput } from '@/utils';

interface IHpModalProps {
  playerId: string | null;
  details: IGameDetails;
  onUpdate: (details: IGameDetails) => void;
  onClose: () => void;
}

const INVALID_AMOUNT_MESSAGE = 'Enter a whole number of 1 or more';

/** Remounted for every opening (see `key`), so the amount always starts empty. */
export function HpModal(props: IHpModalProps): React.ReactElement {
  return <HpForm key={props.playerId ?? 'closed'} {...props} />;
}

function HpForm({ playerId, details, onUpdate, onClose }: IHpModalProps): React.ReactElement {
  const [amount, setAmount] = React.useState<string>('');
  const player = playerId === null ? undefined : findPlayer(details, playerId);

  const apply = (action: (id: string, value: number) => IGameDetails): void => {
    if (playerId === null) {
      return;
    }

    const value = parseNumberInput(amount, { integer: true });
    if (value === null || value < 1) {
      toast.info(INVALID_AMOUNT_MESSAGE);
      return;
    }

    onUpdate(action(playerId, value));
    onClose();
  };

  const onDamage = (): void => {
    apply((id, value) => damagePlayer(details, id, value));
  };

  const onHeal = (): void => {
    apply((id, value) => healPlayer(details, id, value));
  };

  const onRestore = (): void => {
    if (playerId === null) {
      return;
    }

    onUpdate(restorePlayer(details, playerId));
    onClose();
  };

  return (
    <Modal
      isOpen={player !== undefined}
      title={player === undefined ? undefined : `${getPlayerName(player.name)}: ${player.hp}/${getMaxHp(player)} HP`}
      onCloseModal={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          name="amount"
          label="Amount"
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          value={amount}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            setAmount(e.currentTarget.value);
          }}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              onDamage();
            }
          }}
        />
        <div className={styles.actions}>
          <Button onClick={onHeal}>Heal</Button>
          <Button onClick={onDamage}>Damage</Button>
          <Button onClick={onRestore}>Restore to Max</Button>
        </div>
      </form>
    </Modal>
  );
}
