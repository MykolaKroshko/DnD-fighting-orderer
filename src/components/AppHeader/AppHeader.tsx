import styles from './styles.module.scss';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { GlobalContext } from '@/App';
import SidebarIcon from '@/assets/icons/sidebar.svg?react';
import SidebarWideIcon from '@/assets/icons/sidebar_wide.svg?react';
import { LayoutContext } from '@/components/AppLayout/AppLayout';

export function AppHeader(): React.ReactNode {
  const { currentGame } = useContext(GlobalContext);
  const { onToggleSidebar, isMobile, sidebarOpen } = useContext(LayoutContext);

  return (
    <header className={styles.container}>
      <button
        className={clsx('btn', styles.sidebar_toggle_btn, { [styles.hidden]: !isMobile && sidebarOpen })}
        onClick={onToggleSidebar}
      >
        {!isMobile && !sidebarOpen ? <SidebarWideIcon className="icon" /> : <SidebarIcon className="icon" />}
      </button>
      <h2 className={styles.title}>{currentGame?.title}</h2>
    </header>
  );
}
