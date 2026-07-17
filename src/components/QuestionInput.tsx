import { useEffect, useRef, useState } from 'react';
import { QUESTION_MAX_LENGTH } from '@/constants/app';
import styles from './QuestionInput.module.css';

export interface QuestionInputProps {
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
}

export function QuestionInput({
  value,
  onChange,
  error,
  placeholder = '把心中所想，写成一句话…',
  disabled = false,
  autoFocus = true,
  maxLength = QUESTION_MAX_LENGTH,
}: QuestionInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  // Autosize textarea to content
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  const length = value.length;
  const overLimit = length > maxLength;
  const counterClass = [
    styles.counter,
    overLimit ? styles.counterOver : '',
    length > maxLength * 0.8 ? styles.counterWarn : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        styles.wrap,
        isFocused ? styles.focused : '',
        error ? styles.errored : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <textarea
        ref={ref}
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        spellCheck={false}
        aria-invalid={!!error}
        aria-describedby={error ? 'question-input-error' : undefined}
      />
      <div className={styles.footer}>
        {error ? (
          <span id="question-input-error" className={styles.error}>
            {error}
          </span>
        ) : (
          <span className={styles.hint}>用一句话表达最想知道的</span>
        )}
        <span className={counterClass}>
          {length} / {maxLength}
        </span>
      </div>
    </div>
  );
}

export default QuestionInput;
