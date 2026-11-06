import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '@/api/client';
import { Button, Field, Heading } from '@/components';
import styles from './FormName.module.css';

interface FormNameProps {
  name: string;
  /** Saves the new name. Rejects with ApiError when the API says no. */
  onRename: (name: string) => Promise<void>;
}

/*
  The form's name with an edit button. Editing swaps the heading for a field:
  Enter or Spara saves, Escape or Avbryt cancels, and focus goes back to the
  edit button afterwards.
*/
function FormName({ name, onRename }: FormNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  useEffect(() => {
    if (!editing && returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing]);

  function startEditing() {
    setValue(name);
    setError(undefined);
    setEditing(true);
  }

  function stopEditing() {
    returnFocus.current = true;
    setEditing(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Formuläret måste ha ett namn');
      return;
    }
    if (trimmed === name) {
      stopEditing();
      return;
    }

    setSaving(true);
    try {
      await onRename(trimmed);
      stopEditing();
    } catch (err) {
      // A 422 says what's wrong with the name; anything else gets the general message
      const fieldError = err instanceof ApiError ? err.fieldErrors.find((f) => f.field === 'name') : undefined;
      setError(fieldError?.message ?? (err instanceof Error ? err.message : 'Namnet kunde inte sparas.'));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className={styles.name}>
        <Heading level={2} size="lg">
          {name}
        </Heading>
        <Button
          ref={editButtonRef}
          iconOnly
          variant="ghost"
          size="sm"
          leftIcon={Pencil}
          ariaLabel="Ändra formulärets namn"
          onClick={startEditing}
        />
      </div>
    );
  }

  return (
    <form
      className={styles.editor}
      onSubmit={(e) => void submit(e)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          stopEditing();
        }
      }}
    >
      <Field label="Formulärets namn" value={value} onChange={setValue} error={error} maxLength={100} autoFocus />
      <div className={styles.actions}>
        <Button type="submit" size="sm" loading={saving}>
          Spara
        </Button>
        <Button variant="secondary" size="sm" onClick={stopEditing}>
          Avbryt
        </Button>
      </div>
    </form>
  );
}

export default FormName;
