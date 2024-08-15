import clsx from 'clsx';
import React from 'react';
import { PlayersTable } from '@/components/PlayersTable/PlayersTable';
import styles from '@/components/SetupStage/styles.module.scss';
import type { IGameDetails } from '@/types';

interface ICombatStageProps {
  details: IGameDetails;
  updateGameDetails: (newDetails: IGameDetails) => void;
}

export function CombatStage({ details, updateGameDetails }: ICombatStageProps): React.ReactElement {
  return (
    <>
      <div className={styles.actions}>
        <button className={clsx('btn', styles.change_status)}>Finish Combat</button>
      </div>
      <PlayersTable
        details={details}
        setCurrentPlayer={() => {}}
        setModalsStatus={() => {}}
        updateGameDetails={updateGameDetails}
      />
    </>
  );
}
