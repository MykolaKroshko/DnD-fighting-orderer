import styles from './styles.module.scss';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppAside } from '@/components/AppAside/AppAside';
import { AppHeader } from '@/components/AppHeader/AppHeader';

export function AppLayout(): React.ReactNode {
  return (
    <>
      <AppHeader />
      <div className={styles.container}>
        <AppAside />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
