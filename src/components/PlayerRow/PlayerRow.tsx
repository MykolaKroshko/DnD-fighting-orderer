import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import { type IPlayer, PlayerType } from '@/types';

interface IPlayerProps {
  player: IPlayer;
  onDelete: (player: IPlayer) => void;
  onEdit: (player: IPlayer) => void;
}

export function PlayerRow({ player, onDelete, onEdit }: IPlayerProps): React.ReactElement {
  return (
    <tr
      className={clsx({
        [styles.player]: player.type === PlayerType.Player,
        [styles.ally]: player.type === PlayerType.Ally,
        [styles.enemy]: player.type === PlayerType.Enemy,
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
