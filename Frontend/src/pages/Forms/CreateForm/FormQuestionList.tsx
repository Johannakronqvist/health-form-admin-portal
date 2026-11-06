import { ArrowDown, ArrowUp, GripVertical, Info, Lock, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type RefObject } from 'react';
import type { FormQuestion } from '@/api/types';
import { Button, Heading, Modal, Text } from '@/components';
import styles from './FormQuestionList.module.css';

interface FormQuestionListProps {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
  /** Area names by id, e.g. "physical-work-environment" -> "Fysisk arbetsmiljö". */
  areaLabels: Record<string, string>;
  /** Tells screen reader users what happened (moved, removed). */
  announce: (message: string) => void;
  /** Opens the question details (the info button). */
  onShowDetails: (questionId: string) => void;
  /** Also where focus goes after a removal. */
  headingRef: RefObject<HTMLHeadingElement | null>;
}

/*
  The form's questions. Standard questions are locked at the top. The others can
  be dragged, or moved with the up/down buttons (shown on hover and focus), and
  removed after a confirmation.
*/
function FormQuestionList({
  questions,
  onChange,
  areaLabels,
  announce,
  onShowDetails,
  headingRef,
}: FormQuestionListProps) {
  // While dragging, the list shows `order` as a preview; it's only saved on drop
  const [drag, setDrag] = useState<{ id: string; order: string[] } | null>(null);
  const [toRemove, setToRemove] = useState<FormQuestion | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const byId = new Map(questions.map((q) => [q.questionId, q]));
  const shown = drag ? drag.order.map((id) => byId.get(id)).filter((q) => q !== undefined) : questions;

  /*
    Rows slide to their new place when the order changes (FLIP: note where each
    row is, let React reorder, then animate each row from its old spot to the new one).
  */
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const oldTops = useRef<Map<string, number> | null>(null);

  // Call right before changing the order
  function rememberPositions() {
    oldTops.current = new Map([...rowRefs.current].map(([id, el]) => [id, el.getBoundingClientRect().top]));
  }

  const orderKey = shown.map((q) => q.questionId).join();
  useLayoutEffect(() => {
    const before = oldTops.current;
    oldTops.current = null;
    if (!before || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    for (const [id, el] of rowRefs.current) {
      if (typeof el.animate !== 'function') continue;
      el.getAnimations().forEach((a) => a.cancel());
      const from = before.get(id);
      const shift = from === undefined ? 0 : from - el.getBoundingClientRect().top;
      if (shift) {
        el.animate([{ transform: `translateY(${shift}px)` }, { transform: 'none' }], {
          duration: 200,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        });
      }
    }
  }, [orderKey]);

  // Moving a row can make the browser drop focus, so put it back on the button that was pressed
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const refocusId = useRef<string | null>(null);
  useEffect(() => {
    if (refocusId.current) {
      buttonRefs.current.get(refocusId.current)?.focus();
      refocusId.current = null;
    }
  }, [questions]);

  const firstMovable = questions.findIndex((q) => !q.standard);

  const infoButton = (q: FormQuestion) => (
    <Button
      iconOnly
      variant="secondary"
      size="sm"
      leftIcon={Info}
      ariaLabel={`Visa detaljer: ${q.label}`}
      onClick={() => onShowDetails(q.questionId)}
    />
  );

  function moveTo(id: string, to: number) {
    const from = questions.findIndex((q) => q.questionId === id);
    if (from === to || to < firstMovable || to >= questions.length) return;
    const next = [...questions];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    announce(`"${moved.label}" flyttades till plats ${to + 1} av ${next.length}.`);
  }

  function move(id: string, direction: 'up' | 'down') {
    const from = questions.findIndex((q) => q.questionId === id);
    refocusId.current = `${id}-${direction}`;
    rememberPositions();
    moveTo(id, direction === 'up' ? from - 1 : from + 1);
  }

  /** Dragging over another row: move the dragged row past it once the pointer crosses its middle. */
  function dragOverRow(event: DragEvent<HTMLLIElement>, overId: string) {
    if (!drag || overId === drag.id) return;
    const from = drag.order.indexOf(drag.id);
    const to = drag.order.indexOf(overId);
    const rect = event.currentTarget.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    if ((from < to && event.clientY > middle) || (from > to && event.clientY < middle)) {
      const order = [...drag.order];
      order.splice(from, 1);
      order.splice(to, 0, drag.id);
      rememberPositions();
      setDrag({ id: drag.id, order });
    }
  }

  /** Dropped inside the list: save the previewed order. */
  function dropDragged() {
    if (!drag) return;
    const changed = drag.order.some((id, i) => id !== questions[i]?.questionId);
    if (changed) {
      onChange(shown);
      const moved = byId.get(drag.id);
      announce(`"${moved?.label}" flyttades till plats ${drag.order.indexOf(drag.id) + 1} av ${shown.length}.`);
    }
    setDrag(null);
  }

  /** Dropped elsewhere or cancelled with Escape: slide back to the saved order. */
  function endDrag() {
    if (!drag) return;
    rememberPositions();
    setDrag(null);
  }

  function confirmRemove() {
    if (!toRemove) return;
    onChange(questions.filter((q) => q.questionId !== toRemove.questionId));
    announce(`"${toRemove.label}" togs bort från formuläret.`);
    setToRemove(null);
    // The removed row's button is gone, so continue from the list heading
    headingRef.current?.focus();
  }

  return (
    <section aria-labelledby="form-questions-heading" className={styles.section}>
      <div className={styles.header}>
        <Heading
          level={2}
          id="form-questions-heading"
          ref={headingRef}
          tabIndex={-1}
          size="lg"
          className={styles.heading}
        >
          Formulärets frågor
        </Heading>
        <Text size="sm" tone="muted">
          {questions.length === 1 ? '1 fråga' : `${questions.length} frågor`}
        </Text>
      </div>
      <Text id="form-questions-hint" size="sm" tone="muted">
        Dra för att ändra ordning.
      </Text>

      <ol
        className={styles.list}
        aria-labelledby="form-questions-heading"
        aria-describedby="form-questions-hint"
        onDragOver={(e) => {
          if (drag) e.preventDefault(); // allows dropping anywhere in the list, gaps included
        }}
        onDrop={(e) => {
          e.preventDefault();
          dropDragged();
        }}
      >
        {shown.map((q, index) =>
          q.standard ? (
            <li key={q.questionId} className={`${styles.row} ${styles.locked}`}>
              <Lock size={18} className={styles.icon} aria-hidden="true" />
              {infoButton(q)}
              <span className={styles.label}>{q.label}</span>
              <span className={styles.always}>Ingår alltid</span>
            </li>
          ) : (
            <li
              key={q.questionId}
              ref={(el) => {
                if (el) rowRefs.current.set(q.questionId, el);
                else rowRefs.current.delete(q.questionId);
              }}
              className={[styles.row, styles.movable, drag?.id === q.questionId && styles.placeholder]
                .filter(Boolean)
                .join(' ')}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', q.questionId); // Firefox needs data to start a drag
                const order = questions.map((item) => item.questionId);
                // Wait a frame, so the browser's drag image is the normal card, not the placeholder
                requestAnimationFrame(() => setDrag({ id: q.questionId, order }));
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => dragOverRow(e, q.questionId)}
            >
              <GripVertical size={18} className={styles.icon} aria-hidden="true" />
              {infoButton(q)}
              <span className={styles.text}>
                <span className={styles.label}>{q.label}</span>
                <span className={styles.meta}>{areaLabels[q.area]}</span>
              </span>
              <span className={styles.actions}>
                <span className={styles.moveButtons}>
                  <Button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(`${q.questionId}-up`, el);
                    }}
                    iconOnly
                    variant="ghost"
                    size="sm"
                    leftIcon={ArrowUp}
                    ariaLabel={`Flytta upp: ${q.label}`}
                    disabled={index === firstMovable}
                    focusableWhenDisabled
                    onClick={() => move(q.questionId, 'up')}
                  />
                  <Button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(`${q.questionId}-down`, el);
                    }}
                    iconOnly
                    variant="ghost"
                    size="sm"
                    leftIcon={ArrowDown}
                    ariaLabel={`Flytta ned: ${q.label}`}
                    disabled={index === questions.length - 1}
                    focusableWhenDisabled
                    onClick={() => move(q.questionId, 'down')}
                  />
                </span>
                <Button
                  iconOnly
                  variant="secondary"
                  size="sm"
                  leftIcon={X}
                  ariaLabel={`Ta bort: ${q.label}`}
                  onClick={() => setToRemove(q)}
                />
              </span>
            </li>
          ),
        )}
      </ol>

      <Modal
        open={toRemove !== null}
        onClose={() => setToRemove(null)}
        title={`Ta bort "${toRemove?.label ?? ''}" från formuläret?`}
        description="Du kan lägga till den igen från frågebanken."
        dismissLabel="Stäng"
        initialFocus={cancelRef}
        size="sm"
        footer={
          <div className={styles.modalActions}>
            <Button ref={cancelRef} variant="secondary" onClick={() => setToRemove(null)}>
              Avbryt
            </Button>
            <Button variant="danger" onClick={confirmRemove}>
              Ta bort
            </Button>
          </div>
        }
      />
    </section>
  );
}

export default FormQuestionList;
