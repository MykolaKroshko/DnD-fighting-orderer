import React, { useContext, useEffect } from 'react';
import { GlobalContext } from '@/App';
import { GameStatus, type IGameDetails } from '@/types';

const LS_GAME_DETAIL_KEY = 'dnd_fo_game_details';

const emptyGameDetails: IGameDetails = {
  gameId: 0,
  status: GameStatus.Setup,
  players: [],
  allies: [],
  enemies: [],
  round: 0,
};

const getLSGameDetail = (currentGameId: number): IGameDetails => {
  const gameDetail = localStorage.getItem(LS_GAME_DETAIL_KEY + '__' + currentGameId);
  return gameDetail !== null ? JSON.parse(gameDetail) : { ...emptyGameDetails, gameId: currentGameId };
};

// const setLSGameDetail = (details: IGameDetails): void => {
//   localStorage.setItem(LS_GAME_DETAIL_KEY + '__' + details.gameId, JSON.stringify(details));
// };

export function MainPage(): React.ReactElement {
  const { currentGame } = useContext(GlobalContext);
  const [gameDetails, setGameDetails] = React.useState<IGameDetails>({
    ...emptyGameDetails,
    gameId: currentGame?.id ?? 0,
  });

  // function updateGameDetails(newDetails: IGameDetails): void {
  //   setGameDetails(newDetails);
  //   setLSGameDetail(newDetails);
  // }

  useEffect(() => {
    if (currentGame?.id !== undefined) {
      setGameDetails(getLSGameDetail(currentGame.id));
    }
  }, [currentGame?.id]);

  return (
    <>
      <h4>Stage: {gameDetails.status}</h4>
      <p>{JSON.stringify(currentGame)}</p>
      <p>{JSON.stringify(gameDetails)}</p>
    </>
  );
}
