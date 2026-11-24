import styles from './styles.module.scss';
import clsx from 'clsx';
import React from 'react';

export enum EColorVariant {
  green = 'green',
  red = 'red',
  yellow = 'yellow',
  blue = 'blue',
}

export type IButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof EColorVariant;
};

const bgStyles: Record<keyof typeof EColorVariant, string> = {
  [EColorVariant.green]: styles.green,
  [EColorVariant.red]: styles.red,
  [EColorVariant.yellow]: styles.yellow,
  [EColorVariant.blue]: styles.blue,
};

export function Button({ className, children, type = 'button', variant, ...rest }: IButtonProps): React.ReactElement {
  return (
    <button {...rest} type={type} className={clsx(styles.btn, className, variant ? bgStyles[variant] : '')}>
      {children}
    </button>
  );
}
