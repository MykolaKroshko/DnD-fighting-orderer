import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import FightIcon from '@/assets/icons/fight.svg?react';
import PauseIcon from '@/assets/icons/pause.svg?react';
import { getMaxHp } from '@/hp';
import { type IPlayer, PlayerStatus, PlayerType } from '@/types';
import { getPlayerName } from '@/utils';

interface IPlayerProps {
  player: IPlayer;
  onDelete?: (player: IPlayer) => void;
  onTogglePause: (player: IPlayer) => void;
  onEdit?: (player: IPlayer) => void;
  onOpenHp?: (player: IPlayer) => void;
  isCurrentPlayer?: boolean;
  isCombatStage?: boolean;
}

export function PlayerRow({
  player,
  onDelete,
  onTogglePause,
  onEdit,
  onOpenHp,
  isCurrentPlayer,
  isCombatStage,
}: IPlayerProps): React.ReactElement {
  return (
    <tr
      className={clsx({
        [styles.player]: player.type === PlayerType.Player,
        [styles.ally]: player.type === PlayerType.Ally,
        [styles.enemy]: player.type === PlayerType.Enemy,
        [styles.paused]: player.status === PlayerStatus.Paused,
        [styles.down]: player.hp === 0,
        [styles.current]: isCurrentPlayer,
      })}
    >
      <td
        onClick={() => {
          onEdit?.(player);
        }}
      >
        {getPlayerName(player.name)}
      </td>
      <td>
        <button
          type="button"
          className={clsx('btn', styles.hp_btn)}
          onClick={(e) => {
            onOpenHp?.(player);
            e.stopPropagation();
          }}
        >
          {`${player.hp}/${getMaxHp(player)}`}
        </button>
      </td>
      <td>{player.initiative ?? '--'}</td>
      <td>{player.dex ?? '--'}</td>
      <td>{isCombatStage === true && player.status === PlayerStatus.Active ? (player.order ?? '--') : '--'}</td>
      <td>
        <div className={styles.table_actions}>
          <button
            className="btn"
            onClick={(e) => {
              onTogglePause(player);
              e.stopPropagation();
            }}
          >
            {player.status === PlayerStatus.Paused ? <FightIcon className="icon" /> : <PauseIcon className="icon" />}
          </button>
          {onDelete === undefined ? null : (
            <button
              className="btn"
              onClick={(e) => {
                onDelete?.(player);
                e.stopPropagation();
              }}
            >
              <DeleteIcon className="icon" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
