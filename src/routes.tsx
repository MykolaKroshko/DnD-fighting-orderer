import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import { MainPage } from '@/components/MainPage/MainPage';
import { gamePath } from '@/paths';

export const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        {
          path: '/:id?',
          element: <MainPage />,
        },
        {
          path: '*',
          element: <Navigate to={gamePath()} replace />,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') }
);
