/* eslint-disable max-len */
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import { MainPage } from '@/components/MainPage/MainPage';

export enum Pages {
  Root = '/:id?',
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: Pages.Root,
        element: <MainPage />,
      },
    ],
  },
]);
