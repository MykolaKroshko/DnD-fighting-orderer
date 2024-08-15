import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import FightIcon from '@/assets/icons/fight.svg?react';
import PauseIcon from '@/assets/icons/pause.svg?react';
import { type IPlayer, PlayerStatus, PlayerType } from '@/types';

interface IPlayerProps {
  player: IPlayer;
  onDelete: (player: IPlayer) => void;
  onTogglePause: (player: IPlayer) => void;
  onEdit: (player: IPlayer) => void;
}

export function PlayerRow({ player, onDelete, onTogglePause, onEdit }: IPlayerProps): React.ReactElement {
  return (
    <tr
      className={clsx({
        [styles.player]: player.type === PlayerType.Player,
        [styles.ally]: player.type === PlayerType.Ally,
        [styles.enemy]: player.type === PlayerType.Enemy,
        [styles.paused]: player.status === PlayerStatus.Paused,
      })}
    >
      <td
        onClick={() => {
          onEdit(player);
        }}
      >
        {player.name}
      </td>
      <td>{player.initiative ?? '--'}</td>
      <td>{player.dex ?? '--'}</td>
      <td className={styles.table_actions}>
        <button
          className="btn"
          onClick={(e) => {
            onTogglePause(player);
            e.stopPropagation();
          }}
        >
          {player.status === PlayerStatus.Paused ? <FightIcon className="icon" /> : <PauseIcon className="icon" />}
        </button>
        <button
          className="btn"
          onClick={(e) => {
            onDelete(player);
            e.stopPropagation();
          }}
        >
          <DeleteIcon className="icon" />
        </button>
      </td>
    </tr>
  );
}
