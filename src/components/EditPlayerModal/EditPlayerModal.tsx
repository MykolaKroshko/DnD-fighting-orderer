import React, { type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { ModalsStatus } from '@/components/SetupStage/SetupStage';
import { type IGameDetails, type IPlayer, PlayerType } from '@/types';

interface IAddPlayerModalProps {
  currentPlayer: IPlayer | null;
  modalsStatus: ModalsStatus;
  setModalsStatus: (s: ModalsStatus) => void;
  setCurrentPlayer: (p: IPlayer | null) => void;
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

export function EditPlayerModal({
  currentPlayer,
  modalsStatus,
  setModalsStatus,
  setCurrentPlayer,
  details,
  updateGameDetails,
}: IAddPlayerModalProps): React.ReactElement {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameRef.current !== null) {
      nameRef.current?.focus();
    }
  }, [nameRef]);

  return (
    <Modal
      isOpen={modalsStatus === ModalsStatus.ChangeInitiative}
      onCloseModal={() => {
        setModalsStatus(ModalsStatus.None);
        setCurrentPlayer(null);
      }}
      title={`Change ${currentPlayer?.name}'s details`}
      onConfirmModal={() => {
        if (currentPlayer !== null) {
          const typeKey =
            currentPlayer.type === PlayerType.Player
              ? 'players'
              : currentPlayer.type === PlayerType.Ally
                ? 'allies'
                : 'enemies';

          updateGameDetails({
            ...details,
            [typeKey]: details[typeKey].map((player) =>
              player.id === currentPlayer.id ? { ...currentPlayer } : player
            ),
          });
          setModalsStatus(ModalsStatus.None);
          setCurrentPlayer(null);
        }
      }}
    >
      <form>
        <Input
          name="initiative"
          label="Initiative"
          type="number"
          value={currentPlayer?.initiative ?? ''}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            const value = !isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : undefined;
            setCurrentPlayer(currentPlayer === null ? null : { ...currentPlayer, initiative: value });
          }}
        />
        <Input
          name="dex"
          label="Dexterity"
          type="number"
          value={currentPlayer?.dex ?? ''}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            const value = !isNaN(Number(e.currentTarget.value)) ? parseInt(e.currentTarget.value) : undefined;
            setCurrentPlayer(currentPlayer === null ? null : { ...currentPlayer, dex: value });
          }}
        />
      </form>
    </Modal>
  );
}
