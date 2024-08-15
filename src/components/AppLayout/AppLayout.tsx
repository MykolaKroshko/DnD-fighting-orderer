import styles from './styles.module.scss';
import React, { createContext, useCallback, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { AppAside } from '@/components/AppAside/AppAside';
import { AppHeader } from '@/components/AppHeader/AppHeader';

interface ILayoutContext {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

enum SidebarStatus {
  open = 'open',
  close = 'close',
  mobileOpen = 'mobileOpen',
  desktopClose = 'desktopClose',
}

export const LayoutContext = createContext<ILayoutContext>({
  sidebarOpen: false,
  onToggleSidebar: () => {},
  isMobile: false,
});

export function AppLayout(): React.ReactNode {
  const [isMobile, setIsMobile] = React.useState<boolean>(document.body.clientWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState<SidebarStatus>(
    isMobile ? SidebarStatus.close : SidebarStatus.open
  );

  useEffect(() => {
    const mediaWatcher = window.matchMedia('(min-width: 768px)');
    setIsMobile(!mediaWatcher.matches);

    function updateIsNarrowScreen(e: any): void {
      setIsMobile(!(e.matches as boolean));
    }
    mediaWatcher.addEventListener('change', updateIsNarrowScreen);

    return function cleanup() {
      mediaWatcher.removeEventListener('change', updateIsNarrowScreen);
    };
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen === SidebarStatus.open) {
      setSidebarOpen(SidebarStatus.close);
    } else if (!isMobile && sidebarOpen === SidebarStatus.close) {
      setSidebarOpen(SidebarStatus.open);
    }
  }, [isMobile, sidebarOpen]);

  const onToggleSidebar = useCallback((): void => {
    if (isMobile) {
      setSidebarOpen(
        [SidebarStatus.close, SidebarStatus.desktopClose].includes(sidebarOpen)
          ? SidebarStatus.mobileOpen
          : SidebarStatus.close
      );
    } else {
      setSidebarOpen(
        [SidebarStatus.open, SidebarStatus.mobileOpen].includes(sidebarOpen)
          ? SidebarStatus.desktopClose
          : SidebarStatus.open
      );
    }
  }, [isMobile, sidebarOpen]);

  const ctxValue = useMemo<ILayoutContext>(
    () => ({
      sidebarOpen: [SidebarStatus.open, SidebarStatus.mobileOpen].includes(sidebarOpen),
      isMobile,
      onToggleSidebar,
    }),
    [sidebarOpen, isMobile, onToggleSidebar]
  );

  return (
    <LayoutContext.Provider value={ctxValue}>
      <div className={styles.container}>
        <AppAside />
        <div className={styles.content}>
          <AppHeader />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
