import {createContext, useMemo, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/dnd.svg'
import './App.scss'
import {RouterProvider} from "react-router-dom";
import { Pages, router } from '@/routes';

interface IGlobalContext {
}

export const GlobalContext = createContext<IGlobalContext>({
});

function App() {
  const ctxValue = useMemo<IGlobalContext>(
    () => ({
    }),
    []
  );

  return (
    <GlobalContext.Provider value={ctxValue}>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  )
}

export default App
