import { Ban, EllipsisVertical, Plus, Unlink, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import {
  fetchCompanies,
  fetchCompany,
  fetchCompanyForms,
  publishForm,
  unlinkForm,
  unpublishForm,
} from '@/api/companies';
import type { CompanyForm } from '@/api/types';
import type { HighlightState } from '@/lib/highlight';
import { Breadcrumbs, Button, DataTable, Heading, Modal, StateMessage, StatusBadge, Text } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { formatRecentDate } from '@/lib/formatDate';
import ConnectFormModal from './ConnectFormModal';
import styles from './CompanyPage.module.css';

const editUrl = (form: CompanyForm) => `/formular/${form.formId}/redigera`;
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/** What removing a link means, more strongly when it's published or has answers. */
function removeDescription(form: CompanyForm, companyName: string) {
  const parts: string[] = [];
  if (form.status === 'published') parts.push('Formuläret är publicerat. De anställda kan inte längre svara.');
  if (form.responseCount > 0) parts.push(`${form.responseCount} medarbetare på ${companyName} har redan svarat.`);
  parts.push('Själva formuläret finns kvar under Formulär.');
  return parts.join(' ');
}

/** /foretag: opens the first company. */
export function CompaniesIndex() {
  const { state, retry } = useAsync(fetchCompanies);
  if (state.status === 'loading') return <StateMessage variant="loading" message="Hämtar företag" />;
  if (state.status === 'error') {
    return <StateMessage variant="error" message="Företagen kunde inte hämtas." onRetry={retry} />;
  }
  if (state.data.length === 0) return <Text tone="muted">Det finns inga företag än.</Text>;
  return <Navigate to={`/foretag/${state.data[0].id}`} replace />;
}

/** One company and the forms linked to it. */
function CompanyPage() {
  // Forms to highlight, when the user came from Översikt
  const highlight = ((useLocation().state ?? {}) as HighlightState).highlight ?? [];
  const { companyId = '' } = useParams();
  const company = useAsync(useCallback((signal: AbortSignal) => fetchCompany(companyId, signal), [companyId]));
  const forms = useAsync(useCallback((signal: AbortSignal) => fetchCompanyForms(companyId, signal), [companyId]));

  const [connecting, setConnecting] = useState(false);
  const [toRemove, setToRemove] = useState<CompanyForm | null>(null);
  const [toUnpublish, setToUnpublish] = useState<CompanyForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [dialogError, setDialogError] = useState<string>();
  const [pageError, setPageError] = useState<string>();
  const [announcement, setAnnouncement] = useState('');
  const cancelRemoveRef = useRef<HTMLButtonElement>(null);
  const cancelUnpublishRef = useRef<HTMLButtonElement>(null);
  const formsHeadingRef = useRef<HTMLHeadingElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  if (company.state.status === 'loading') return <StateMessage variant="loading" message="Hämtar företaget" />;
  if (company.state.status === 'error') {
    return <StateMessage variant="error" message="Företaget kunde inte hämtas." onRetry={company.retry} />;
  }
  const { name, industry, employeeCount, orgNumber } = company.state.data;
  const linkedIds = forms.state.status === 'success' ? forms.state.data.map((f) => f.formId) : [];

  /** Runs an action from a dialog: keeps it open with the error if it fails. */
  async function runDialogAction(action: () => Promise<unknown>, done: string, close: () => void) {
    setBusy(true);
    setDialogError(undefined);
    try {
      await action();
      setAnnouncement(done);
      close();
      forms.retry();
      // The dialog's button is gone, so continue from the section heading
      formsHeadingRef.current?.focus();
    } catch (error) {
      setDialogError(errorText(error, 'Det gick inte. Försök igen.'));
    } finally {
      setBusy(false);
    }
  }

  async function publish(form: CompanyForm) {
    if (busyId) return; // one publish at a time
    setBusyId(form.formId);
    setPageError(undefined);
    try {
      await publishForm(companyId, form.formId);
      setAnnouncement(`"${form.name}" är publicerat hos ${name}.`);
      forms.retry();
    } catch (error) {
      setPageError(errorText(error, 'Formuläret kunde inte publiceras.'));
    } finally {
      setBusyId(undefined);
    }
  }

  // The connect dialog is removed when it closes, so put focus back on the button that opened it
  function closeConnect() {
    setConnecting(false);
    requestAnimationFrame(() => connectButtonRef.current?.focus());
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Breadcrumbs label="Brödsmulor" items={[{ label: 'Företag' }]} />
        <Heading level={1}>{name}</Heading>
        <Text tone="muted">
          {industry} | {employeeCount} anställda | Org.nr {orgNumber}
        </Text>
      </div>

      <section aria-labelledby="company-forms-heading" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titles}>
            <Heading
              level={2}
              id="company-forms-heading"
              ref={formsHeadingRef}
              tabIndex={-1}
              size="lg"
              className={styles.heading}
            >
              Kopplade formulär
            </Heading>
            <Text size="sm" tone="muted">
              Formulären som de anställda på {name} får. Koppla ett befintligt formulär eller ta bort en koppling.
            </Text>
          </div>
          <Button ref={connectButtonRef} leftIcon={Plus} onClick={() => setConnecting(true)}>
            Koppla formulär
          </Button>
        </div>

        {pageError && (
          <Text size="sm" className={styles.error} role="alert">
            {pageError}
          </Text>
        )}

        {forms.state.status === 'loading' && <StateMessage variant="loading" message="Hämtar formulären" />}
        {forms.state.status === 'error' && (
          <StateMessage variant="error" message="Formulären kunde inte hämtas." onRetry={forms.retry} />
        )}
        {forms.state.status === 'success' && forms.state.data.length === 0 && (
          <Text tone="muted">Inga formulär är kopplade till {name} än.</Text>
        )}
        {forms.state.status === 'success' && forms.state.data.length > 0 && (
          <>
            <DataTable
              labelledBy="company-forms-heading"
              rows={forms.state.data}
              rowKey={(form) => form.formId}
              rowHref={editUrl}
              highlighted={highlight}
              menuHeader="Åtgärder"
              menuLabel={(form) => `Fler åtgärder för ${form.name}`}
              menuItems={(form) => [
                ...(form.status === 'draft'
                  ? [{ value: 'publish', label: 'Publicera', icon: Upload, onSelect: () => void publish(form) }]
                  : []),
                ...(form.hasUnpublishedChanges
                  ? [
                      {
                        value: 'publish-changes',
                        label: 'Publicera ändringar',
                        icon: Upload,
                        onSelect: () => void publish(form),
                      },
                    ]
                  : []),
                ...(form.status === 'published'
                  ? [
                      {
                        value: 'unpublish',
                        label: 'Avpublicera',
                        icon: Ban,
                        onSelect: () => {
                          setDialogError(undefined);
                          setToUnpublish(form);
                        },
                      },
                    ]
                  : []),
                { separator: true },
                {
                  value: 'unlink',
                  label: 'Koppla bort formulär',
                  icon: Unlink,
                  destructive: true,
                  onSelect: () => {
                    setDialogError(undefined);
                    setToRemove(form);
                  },
                },
              ]}
              nameHeader="Formulär"
              name={(form) => form.name}
              nameDetail={(form) =>
                form.companyCount > 1 ? `Används av ${form.companyCount} företag` : 'Används bara här'
              }
              columns={[
                { header: 'Formulärtyp', cell: (form) => form.formTypeName },
                {
                  header: 'Utskick',
                  className: styles.muted,
                  cell: (form) =>
                    form.status === 'published' && form.publishedAt
                      ? `Publicerad ${formatRecentDate(form.publishedAt)}`
                      : 'Ej publicerad',
                },
                {
                  header: 'Status',
                  cell: (form) => (
                    <div className={styles.status}>
                      <StatusBadge status={form.status} />
                      {form.hasUnpublishedChanges && <span className={styles.unpublished}>Opublicerade ändringar</span>}
                    </div>
                  ),
                },
              ]}
            />
            <Text size="sm" tone="muted">
              Klicka på en rad för att redigera formuläret. Fler åtgärder (
              <EllipsisVertical size={14} className={styles.inlineIcon} aria-hidden="true" />
              ): publicera, avpublicera och koppla bort. Att koppla bort tar inte bort själva formuläret.
            </Text>
          </>
        )}
      </section>

      <Modal
        open={toUnpublish !== null}
        onClose={() => setToUnpublish(null)}
        title={`Avpublicera "${toUnpublish?.name ?? ''}" hos ${name}?`}
        description={`De anställda kan inte längre svara på formuläret.${
          toUnpublish && toUnpublish.responseCount > 0
            ? ` De ${toUnpublish.responseCount} svar som kommit in finns kvar.`
            : ''
        } Du kan publicera det igen senare.`}
        dismissLabel="Stäng"
        initialFocus={cancelUnpublishRef}
        footer={
          <div className={styles.modalActions}>
            {dialogError && (
              <Text size="sm" className={styles.error} role="alert">
                {dialogError}
              </Text>
            )}
            <Button ref={cancelUnpublishRef} variant="secondary" onClick={() => setToUnpublish(null)}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() =>
                toUnpublish &&
                void runDialogAction(
                  () => unpublishForm(companyId, toUnpublish.formId),
                  `"${toUnpublish.name}" är avpublicerat hos ${name}.`,
                  () => setToUnpublish(null),
                )
              }
            >
              Avpublicera
            </Button>
          </div>
        }
      />

      <Modal
        open={toRemove !== null}
        onClose={() => setToRemove(null)}
        title={`Koppla bort "${toRemove?.name ?? ''}" från ${name}?`}
        description={toRemove ? removeDescription(toRemove, name) : undefined}
        dismissLabel="Stäng"
        initialFocus={cancelRemoveRef}
        footer={
          <div className={styles.modalActions}>
            {dialogError && (
              <Text size="sm" className={styles.error} role="alert">
                {dialogError}
              </Text>
            )}
            <Button ref={cancelRemoveRef} variant="secondary" onClick={() => setToRemove(null)}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() =>
                toRemove &&
                void runDialogAction(
                  () => unlinkForm(companyId, toRemove.formId),
                  `"${toRemove.name}" kopplades bort från ${name}.`,
                  () => setToRemove(null),
                )
              }
            >
              Koppla bort
            </Button>
          </div>
        }
      />

      {connecting && (
        <ConnectFormModal
          companyId={companyId}
          companyName={name}
          employeeCount={employeeCount}
          linkedIds={linkedIds}
          onClose={closeConnect}
          onConnected={(formName, published) => {
            closeConnect();
            setAnnouncement(
              published
                ? `"${formName}" är kopplat och publicerat hos ${name}.`
                : `"${formName}" är kopplat som utkast.`,
            );
            forms.retry();
          }}
        />
      )}

      {/* Changes on the page are announced here */}
      <p role="status" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}

export default CompanyPage;
