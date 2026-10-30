import styles from './styles.module.scss';
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CombatStage } from '@/components/CombatStage/CombatStage';
import { SetupStage } from '@/components/SetupStage/SetupStage';
import { useCurrentGame } from '@/globalContext';
import { gamePath } from '@/paths';
import { getGameDetails, setGameDetails as saveGameDetails } from '@/storage';
import { GameStatus, type IGameDetails } from '@/types';

export function MainPage(): React.ReactElement {
  const { id } = useParams();
  const currentGame = useCurrentGame();

  if (currentGame !== null) {
    return <GameView key={currentGame.id} gameId={currentGame.id} />;
  }

  if (id !== undefined) {
    return <Navigate to={gamePath()} replace />;
  }

  return <h4 style={{ textAlign: 'center' }}>Please create new game or select existing one to see its details</h4>;
}

function GameView({ gameId }: { gameId: string }): React.ReactElement {
  const [gameDetails, setGameDetails] = React.useState<IGameDetails>(() => getGameDetails(gameId));

  function updateGameDetails(newDetails: IGameDetails): void {
    setGameDetails(newDetails);
    saveGameDetails(newDetails);
  }

  return (
    <>
      <h4>
        Stage: {gameDetails.status}
        {gameDetails.status === GameStatus.Combat ? ', Round: ' + gameDetails.round : ''}
      </h4>
      <div className={styles.content}>
        {gameDetails.status === GameStatus.Setup ? (
          <SetupStage details={gameDetails} updateGameDetails={updateGameDetails} />
        ) : (
          <CombatStage details={gameDetails} updateGameDetails={updateGameDetails} />
        )}
      </div>
    </>
  );
}
