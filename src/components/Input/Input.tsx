import styles from './styles.module.scss';
import React, { type InputHTMLAttributes } from 'react';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function Input({ label, type = 'text', inputRef, ...props }: IInputProps): React.ReactElement {
  return (
    <div className="form_item">
      <label className="form_item">
        <span className="form_label_text">{label}</span>
        <input type={type} ref={inputRef} className={styles.form_input} {...props} />
      </label>
    </div>
  );
}
