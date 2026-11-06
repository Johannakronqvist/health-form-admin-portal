import { useEffect, type RefObject } from 'react';

export interface UseDismissableOptions {
  open: boolean;
  onDismiss: () => void;
  /** Escape returns focus here; an outside click deliberately does not. */
  triggerRef?: RefObject<HTMLElement | null> | null;
  contentRef?: RefObject<HTMLElement | null> | null;
}

/** Closes a popup on Escape or a press outside it (and outside its trigger). */
export function useDismissable({ open, onDismiss, triggerRef, contentRef }: UseDismissableOptions): void {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onDismiss();
      triggerRef?.current?.focus();
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const inContent = target ? contentRef?.current?.contains(target) : false;
      // The trigger is excluded so its own click can toggle instead of closing and reopening.
      const inTrigger = target ? triggerRef?.current?.contains(target) : false;
      if (!inContent && !inTrigger) onDismiss();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, onDismiss, triggerRef, contentRef]);
}
