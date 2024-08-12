import styles from './styles.module.scss';
import React, { type InputHTMLAttributes } from 'react';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: IInputProps): React.ReactElement {
  return (
    <div className="form_item">
      <label className="form_item">
        <span className="form_label_text">{label}</span>
        <input type="text" className={styles.form_input} {...props} />
      </label>
    </div>
  );
}
