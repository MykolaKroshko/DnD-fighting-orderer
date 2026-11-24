import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { useContext } from 'react';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { LayoutContext } from '@/components/AppLayout/AppLayout';
import { Button } from '@/components/Button/Button';
import { useCurrentGame } from '@/globalContext';
import { getGameTitle } from '@/utils';

export function AppHeader(): React.ReactNode {
  const currentGame = useCurrentGame();
  const { onToggleSidebar, isMobile, sidebarOpen } = useContext(LayoutContext);

  return (
    <header className={styles.container}>
      <Button
        className={clsx(styles.sidebar_toggle_btn, { [styles.hidden]: !isMobile && sidebarOpen })}
        onClick={onToggleSidebar}
      >
        {!isMobile && !sidebarOpen ? <SidebarWideIcon className="icon" /> : <SidebarIcon className="icon" />}
      </Button>
      <h2 className={styles.title}>{currentGame === null ? null : getGameTitle(currentGame.title)}</h2>
    </header>
  );
}
