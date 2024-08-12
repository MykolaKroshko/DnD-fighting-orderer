import React, { useContext } from 'react';
import { GlobalContext } from '@/App';

export function MainPage(): React.ReactElement {
  const { currentGame } = useContext(GlobalContext);

  return <p>{JSON.stringify(currentGame)}</p>;
}
