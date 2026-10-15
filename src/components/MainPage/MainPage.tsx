import styles from './styles.module.scss';
import React, { useContext, useEffect, useMemo } from 'react';
import { GlobalContext } from '@/App';
import { CombatStage } from '@/components/CombatStage/CombatStage';
import { SetupStage } from '@/components/SetupStage/SetupStage';
import { getGameDetails, setGameDetails as saveGameDetails } from '@/storage';
import { GameStatus, type IGameDetails } from '@/types';
import { createEmptyGameDetails } from '@/utils';

export function MainPage(): React.ReactElement {
  const { currentGame } = useContext(GlobalContext);
  const [gameDetails, setGameDetails] = React.useState<IGameDetails>(() =>
    createEmptyGameDetails(currentGame?.id ?? '')
  );

  function updateGameDetails(newDetails: IGameDetails): void {
    setGameDetails(newDetails);
    saveGameDetails(newDetails);
  }

  useEffect(() => {
    if (currentGame?.id !== undefined) {
      setGameDetails(getGameDetails(currentGame.id));
    }
  }, [currentGame?.id]);

  const content = useMemo(() => {
    switch (gameDetails.status) {
      case GameStatus.Setup:
        return <SetupStage details={gameDetails} updateGameDetails={updateGameDetails} />;
      case GameStatus.Combat:
        return <CombatStage details={gameDetails} updateGameDetails={updateGameDetails} />;
      default:
        return <></>;
    }
  }, [gameDetails]);

  return currentGame === null ? (
    <h4 style={{ textAlign: 'center' }}>Please create new game or select existing one to see its details</h4>
  ) : (
    <>
      <h4>
        Stage: {gameDetails.status}
        {gameDetails.status === GameStatus.Combat ? ', Round: ' + gameDetails.round : ''}
      </h4>
      <div className={styles.content}>{content}</div>
    </>
  );
}
