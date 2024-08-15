import styles from './styles.module.scss';
import React, { useContext, useEffect, useMemo } from 'react';
import { GlobalContext } from '@/App';
import { CombatStage } from '@/components/CombatStage/CombatStage';
import { SetupStage } from '@/components/SetupStage/SetupStage';
import { GameStatus, type IGameDetails } from '@/types';

const LS_GAME_DETAIL_KEY = 'dnd_fo_game_details';

const emptyGameDetails: IGameDetails = {
  gameId: 0,
  status: GameStatus.Setup,
  players: [],
  allies: [],
  enemies: [],
  round: 1,
};

const getLSGameDetail = (currentGameId: number): IGameDetails => {
  const gameDetail = localStorage.getItem(LS_GAME_DETAIL_KEY + '__' + currentGameId);
  return gameDetail !== null ? JSON.parse(gameDetail) : { ...emptyGameDetails, gameId: currentGameId };
};

const setLSGameDetail = (details: IGameDetails): void => {
  localStorage.setItem(LS_GAME_DETAIL_KEY + '__' + details.gameId, JSON.stringify(details));
};

export function MainPage(): React.ReactElement {
  const { currentGame } = useContext(GlobalContext);
  const [gameDetails, setGameDetails] = React.useState<IGameDetails>({
    ...emptyGameDetails,
    gameId: currentGame?.id ?? 0,
  });

  function updateGameDetails(newDetails: IGameDetails): void {
    setGameDetails(newDetails);
    setLSGameDetail(newDetails);
  }

  useEffect(() => {
    if (currentGame?.id !== undefined) {
      setGameDetails(getLSGameDetail(currentGame.id));
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
