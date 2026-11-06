import { Alert } from '@/components/Alert/Alert';
import { Button } from '@/components/Button/Button';
import { Spinner } from '@/components/Spinner/Spinner';
import { Text } from '@/components/Text/Text';
import styles from './StateMessage.module.css';

interface StateMessageProps {
  variant: 'loading' | 'error' | 'empty';
  message: string;
  /** Shows a "Försök igen" button (for errors). */
  onRetry?: () => void;
}

/** Loading, error and empty states. */
export function StateMessage({ variant, message, onRetry }: StateMessageProps) {
  if (variant === 'error') {
    return (
      <Alert tone="danger" title={message} live="assertive">
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Försök igen
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <div className={styles.message} role="status">
      {variant === 'loading' && <Spinner size="sm" label="" aria-hidden="true" />}
      <Text tone="muted">{message}</Text>
    </div>
  );
}
