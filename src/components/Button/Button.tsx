import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';

export type IButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, children, type = 'button', ...rest }: IButtonProps): React.ReactElement {
  return (
    <button {...rest} type={type} className={clsx(styles.btn, className)}>
      {children}
    </button>
  );
}
