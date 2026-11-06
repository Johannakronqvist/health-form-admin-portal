import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import type { HeadingLevel, Size } from '@/components/types';
import styles from './Modal.module.css';

/*
  Built on the native <dialog>: focus stays inside, the page behind is inert,
  Escape closes it and focus returns to where it was when it closes.
*/

export interface ModalProps {
  open: boolean;
  /** Called for the close button, Escape and a backdrop click. */
  onClose: () => void;
  title: string;
  /** Shown above the title, e.g. badges. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: Size;
  dismissLabel?: string;
  showDismiss?: boolean;
  dismissOnBackdrop?: boolean;
  /** Focused on open, instead of the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
  headingLevel?: HeadingLevel;
}

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = 'md',
  dismissLabel = 'Close',
  showDismiss = true,
  dismissOnBackdrop = true,
  initialFocus,
  headingLevel = 2,
}: ModalProps) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  // Lets the close listener tell "React closed it" from "the user closed it", so onClose isn't called twice
  const openRef = useRef(open);
  const titleId = `${id}-title`;
  const descriptionId = description ? `${id}-description` : undefined;
  const Heading = `h${headingLevel}` as const;

  // Drive the native element from the open prop
  useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocus?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  // Escape and other browser-initiated closes arrive as a close event
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    const onCloseEvent = () => {
      if (openRef.current) onClose();
    };
    dialog.addEventListener('close', onCloseEvent);
    return () => dialog.removeEventListener('close', onCloseEvent);
  }, [onClose]);

  // The dialog doesn't stop the page behind it from scrolling
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.modal} ${styles[size]}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // A press on the dialog element itself is the backdrop; anything inside hits .inner
      onClick={(e) => {
        if (dismissOnBackdrop && e.target === ref.current) onClose();
      }}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.titleGroup}>
            {eyebrow}
            <Heading id={titleId} className={styles.title}>
              {title}
            </Heading>
          </div>
          {showDismiss && (
            <button type="button" className={styles.dismiss} onClick={onClose} aria-label={dismissLabel}>
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        {children && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
