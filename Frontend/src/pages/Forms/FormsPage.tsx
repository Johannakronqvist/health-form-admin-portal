import { Building2, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { copyForm, deleteForm, fetchForms } from '@/api/forms';
import type { FormListItem } from '@/api/types';
import type { HighlightState } from '@/lib/highlight';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  DataTable,
  Heading,
  Modal,
  SearchField,
  StateMessage,
  Text,
  ToggleGroup,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { formatRecentDate } from '@/lib/formatDate';
import styles from './FormsPage.module.css';

const STEP_NAMES = ['Formulärtyp', 'Frågor', 'Granska och spara'];

/** Set by the create flow after "Spara formulär". */
interface SavedState {
  savedFormId?: string;
  savedFormName?: string;
  /** True when changes to an existing form were saved. */
  edited?: boolean;
}

const continueUrl = (form: FormListItem) => `/formular/nytt?steg=${form.wizardStep}&utkast=${form.id}`;
/** Drafts continue where they were left; saved forms open for editing. */
const openUrl = (form: FormListItem) => (form.status === 'draft' ? continueUrl(form) : `/formular/${form.id}/redigera`);

/**
  "Fortsätt", named with the form for screen readers since there can be several.
  The label starts with the visible word, for voice control.
*/
function ContinueLink({ form }: { form: FormListItem }) {
  return (
    <Link to={continueUrl(form)} className={styles.continue} aria-label={`Fortsätt med ${form.name}`}>
      Fortsätt
      <ChevronRight size={16} aria-hidden="true" />
    </Link>
  );
}

/** A draft in "Fortsätt där du slutade". */
function DraftCard({ form }: { form: FormListItem }) {
  const chosen =
    form.selectedQuestionCount === 0
      ? 'Inga frågor valda än'
      : `${form.selectedQuestionCount} ${form.selectedQuestionCount === 1 ? 'fråga' : 'frågor'} vald${form.selectedQuestionCount === 1 ? '' : 'a'}`;

  return (
    <Card as="article" padding="sm" className={styles.draft}>
      <div className={styles.draftTop}>
        <Heading level={3} size="base">
          {form.name}
        </Heading>
        <Badge tone="warning" variant="soft">
          Utkast
        </Badge>
      </div>
      <Text size="sm" tone="muted">
        {form.formTypeName} | {chosen}
      </Text>
      <div className={styles.draftBottom}>
        {/* Done steps navy, the current one green, as in the step indicator */}
        <span className={styles.steps} aria-hidden="true">
          {STEP_NAMES.map((name, i) => (
            <span
              key={name}
              className={
                i + 1 < form.wizardStep ? styles.stepDone : i + 1 === form.wizardStep ? styles.stepCurrent : styles.step
              }
            />
          ))}
        </span>
        <Text size="sm" tone="muted" className={styles.draftMeta}>
          Steg {form.wizardStep} av 3 | {STEP_NAMES[form.wizardStep - 1]} | Ändrad {formatRecentDate(form.updatedAt)}
        </Text>
        <ContinueLink form={form} />
      </div>
    </Card>
  );
}

/** Formulär: drafts to continue, and all forms in a table. */
function FormsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const saved = (location.state ?? {}) as SavedState;
  // Forms to highlight, when the user came from Översikt
  const highlight = ((location.state ?? {}) as HighlightState).highlight ?? [];
  const { state, retry } = useAsync(fetchForms);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'saved' | 'draft'>('all');
  const [toDelete, setToDelete] = useState<FormListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string>();
  const [pageError, setPageError] = useState<string>();
  const [announcement, setAnnouncement] = useState('');
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const tableHeadingRef = useRef<HTMLHeadingElement>(null);

  const forms = state.status === 'success' ? state.data : [];
  const drafts = forms.filter((f) => f.status === 'draft');
  const query = search.trim().toLowerCase();
  const visible = forms.filter(
    (f) =>
      (status === 'all' || f.status === status) &&
      (!query || f.name.toLowerCase().includes(query) || f.formTypeName.toLowerCase().includes(query)),
  );

  // Clear the saved message from the history entry, so it doesn't come back on reload
  const dismissSaved = () => navigate(location.pathname, { replace: true, state: null });

  async function copy(form: FormListItem) {
    setPageError(undefined);
    try {
      const created = await copyForm(form.id);
      setAnnouncement(`"${created.name}" skapades som utkast.`);
      retry();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Formuläret kunde inte kopieras.');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDialogError(undefined);
    try {
      await deleteForm(toDelete.id);
      setAnnouncement(`"${toDelete.name}" togs bort.`);
      setToDelete(null);
      retry();
      // The row's menu button is gone, so continue from the table heading
      tableHeadingRef.current?.focus();
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Formuläret kunde inte tas bort.');
    } finally {
      setDeleting(false);
    }
  }

  // A form that companies use can't be deleted; the dialog says so instead of asking
  const deleteBlocked = (toDelete?.companyCount ?? 0) > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <Breadcrumbs label="Brödsmulor" items={[{ label: 'Formulär' }]} />
          <Heading level={1}>Formulär</Heading>
          <Text tone="muted">Skapa och redigera hälsoformulär</Text>
        </div>
        <Button leftIcon={Plus} onClick={() => navigate('/formular/nytt')}>
          Skapa formulär
        </Button>
      </div>

      {saved.savedFormName && !saved.edited && (
        <Alert tone="success" title="Formuläret är sparat" live="polite" onDismiss={dismissSaved} dismissLabel="Stäng">
          <div className={styles.savedBody}>
            <span>"{saved.savedFormName}" är klart att kopplas till ett företag.</span>
            <Button size="sm" leftIcon={Building2} onClick={() => navigate('/foretag')}>
              Koppla till ett företag
            </Button>
          </div>
        </Alert>
      )}

      {saved.savedFormName && saved.edited && (
        <Alert
          tone="success"
          title="Ändringarna är sparade"
          live="polite"
          onDismiss={dismissSaved}
          dismissLabel="Stäng"
        >
          "{saved.savedFormName}" är uppdaterat.
          {(forms.find((f) => f.id === saved.savedFormId)?.publishedCount ?? 0) > 0 &&
            ' Företag som redan har formuläret får ändringarna när du publicerar det igen hos dem.'}
        </Alert>
      )}

      {state.status === 'loading' && <StateMessage variant="loading" message="Hämtar formulär" />}
      {state.status === 'error' && (
        <StateMessage variant="error" message="Formulären kunde inte hämtas." onRetry={retry} />
      )}

      {state.status === 'success' && drafts.length > 0 && (
        <section aria-labelledby="drafts-heading" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Heading level={2} id="drafts-heading" size="base">
              Fortsätt där du slutade
            </Heading>
            <Text size="sm" tone="muted">
              {drafts.length} utkast
            </Text>
          </div>
          <div className={styles.drafts}>
            {drafts.map((form) => (
              <DraftCard key={form.id} form={form} />
            ))}
          </div>
        </section>
      )}

      {state.status === 'success' && (
        <section aria-labelledby="all-forms-heading" className={styles.section}>
          <Heading
            level={2}
            id="all-forms-heading"
            ref={tableHeadingRef}
            tabIndex={-1}
            size="base"
            className={styles.heading}
          >
            Alla formulär
          </Heading>
          {pageError && (
            <Text size="sm" className={styles.error} role="alert">
              {pageError}
            </Text>
          )}
          <div className={styles.filters}>
            <div className={styles.search}>
              <SearchField
                label="Sök på namn eller formulärtyp"
                hideLabel
                placeholder="Sök på namn eller formulärtyp"
                clearLabel="Rensa sökningen"
                value={search}
                onSearch={setSearch}
                resultCount={visible.length}
                resultLabel={(count) => (count === 1 ? '1 formulär' : `${count} formulär`)}
              />
            </div>
            <ToggleGroup
              label="Visa"
              defaultValue="all"
              onChange={setStatus}
              options={[
                { value: 'all', label: `Alla ${forms.length}` },
                { value: 'saved', label: `Sparade ${forms.length - drafts.length}` },
                { value: 'draft', label: `Utkast ${drafts.length}` },
              ]}
            />
          </div>

          {visible.length === 0 ? (
            <Text tone="muted">Inga formulär matchar sökningen.</Text>
          ) : (
            <DataTable
              labelledBy="all-forms-heading"
              rows={visible}
              rowKey={(form) => form.id}
              rowHref={openUrl}
              rowClassName={(form) => (form.id === saved.savedFormId ? styles.justSaved : undefined)}
              highlighted={highlight}
              menuHeader="Åtgärder"
              menuLabel={(form) => `Fler åtgärder för ${form.name}`}
              menuItems={(form) => [
                { value: 'copy', label: 'Kopiera formulär', icon: Copy, onSelect: () => void copy(form) },
                { separator: true },
                {
                  value: 'delete',
                  label: 'Ta bort formulär',
                  icon: Trash2,
                  destructive: true,
                  onSelect: () => {
                    setDialogError(undefined);
                    setToDelete(form);
                  },
                },
              ]}
              nameHeader="Formulär"
              name={(form) => form.name}
              columns={[
                { header: 'Formulärtyp', cell: (form) => form.formTypeName },
                {
                  header: 'Status',
                  cell: (form) =>
                    form.status === 'draft' ? (
                      <Badge tone="warning" variant="soft">
                        Utkast
                      </Badge>
                    ) : (
                      <Badge tone="success" variant="soft">
                        Sparad
                      </Badge>
                    ),
                },
                {
                  header: 'Används av',
                  cell: (form) =>
                    form.status === 'draft'
                      ? '-'
                      : form.companyCount === 0
                        ? 'Inget företag'
                        : `${form.companyCount} företag`,
                },
                {
                  header: 'Senast ändrad',
                  cell: (form) => (
                    <>
                      <span className={styles.changed}>{formatRecentDate(form.updatedAt)}</span>
                      <span className={styles.changedBy}>av {form.updatedBy}</span>
                    </>
                  ),
                },
              ]}
            />
          )}
        </section>
      )}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={deleteBlocked ? `"${toDelete?.name ?? ''}" kan inte tas bort` : `Ta bort "${toDelete?.name ?? ''}"?`}
        description={
          deleteBlocked
            ? `Formuläret är kopplat till ${toDelete?.companyCount} företag. Koppla bort det under Företag först.`
            : 'Formuläret tas bort för gott. Det går inte att ångra.'
        }
        dismissLabel="Stäng"
        initialFocus={cancelDeleteRef}
        size="sm"
        footer={
          <div className={styles.modalActions}>
            {dialogError && (
              <Text size="sm" className={styles.error} role="alert">
                {dialogError}
              </Text>
            )}
            <Button ref={cancelDeleteRef} variant="secondary" onClick={() => setToDelete(null)}>
              {deleteBlocked ? 'Stäng' : 'Avbryt'}
            </Button>
            {!deleteBlocked && (
              <Button variant="danger" loading={deleting} onClick={() => void confirmDelete()}>
                Ta bort formulär
              </Button>
            )}
          </div>
        }
      />

      {/* Copies and removals are announced here */}
      <p role="status" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}

export default FormsPage;
