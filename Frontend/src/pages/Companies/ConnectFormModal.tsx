import { useState } from 'react';
import { linkForm } from '@/api/companies';
import { fetchForms } from '@/api/forms';
import { Alert, Badge, Button, Modal, RadioCard, SearchField, StateMessage, Text } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import styles from './ConnectFormModal.module.css';

interface ConnectFormModalProps {
  companyId: string;
  companyName: string;
  employeeCount: number;
  /** Forms already linked to the company; shown but can't be chosen. */
  linkedIds: string[];
  onClose: () => void;
  onConnected: (formName: string, published: boolean) => void;
}

const usedBy = (count: number) => (count === 0 ? 'används inte än' : `används av ${count} företag`);

/*
  "Koppla formulär": pick a saved form, and whether to
  publish it now or later. Drafts aren't listed, since only saved forms can be linked.

  Render it only while it's open, so it fetches fresh forms and starts empty every
  time. It's removed when it closes, so the page moves focus back itself.
*/
function ConnectFormModal({
  companyId,
  companyName,
  employeeCount,
  linkedIds,
  onClose,
  onConnected,
}: ConnectFormModalProps) {
  const { state, retry } = useAsync(fetchForms);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [error, setError] = useState<string>();
  const [connecting, setConnecting] = useState(false);

  const saved = state.status === 'success' ? state.data.filter((f) => f.status === 'saved') : [];
  const query = search.trim().toLowerCase();
  const visible = saved.filter(
    (f) => !query || f.name.toLowerCase().includes(query) || f.formTypeName.toLowerCase().includes(query),
  );

  async function connect() {
    const form = saved.find((f) => f.id === selectedId);
    if (!form) {
      setError('Välj ett formulär att koppla.');
      return;
    }
    setConnecting(true);
    setError(undefined);
    try {
      await linkForm(companyId, form.id, when === 'now');
      onConnected(form.name, when === 'now');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formuläret kunde inte kopplas.');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Koppla formulär till ${companyName}`}
      description="Välj ett sparat formulär och om det ska publiceras direkt."
      dismissLabel="Stäng"
      footer={
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button loading={connecting} onClick={() => void connect()}>
            Koppla formulär
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        {error && <Alert tone="danger" title={error} live="assertive" />}

        <section aria-labelledby="choose-form-heading" className={styles.part}>
          <h3 id="choose-form-heading" className={styles.heading}>
            1. Välj formulär
          </h3>

          {state.status === 'loading' && <StateMessage variant="loading" message="Hämtar formulär" />}
          {state.status === 'error' && (
            <StateMessage variant="error" message="Formulären kunde inte hämtas." onRetry={retry} />
          )}

          {state.status === 'success' && (
            <>
              <SearchField
                label="Sök formulär"
                hideLabel
                placeholder="Sök formulär"
                clearLabel="Rensa sökningen"
                value={search}
                onSearch={setSearch}
                resultCount={visible.length}
                resultLabel={(count) => (count === 1 ? '1 formulär' : `${count} formulär`)}
              />
              {visible.length === 0 ? (
                <Text tone="muted">Inga sparade formulär matchar sökningen.</Text>
              ) : (
                <fieldset className={styles.forms} aria-labelledby="choose-form-heading">
                  {visible.map((form) => {
                    const linked = linkedIds.includes(form.id);
                    return (
                      <RadioCard
                        key={form.id}
                        name="formToConnect"
                        value={form.id}
                        title={form.name}
                        description={linked ? form.formTypeName : `${form.formTypeName} | ${usedBy(form.companyCount)}`}
                        checked={selectedId === form.id}
                        disabled={linked}
                        badge={
                          linked ? (
                            <Badge tone="neutral" variant="soft">
                              Redan kopplat
                            </Badge>
                          ) : undefined
                        }
                        onChange={(id) => {
                          setSelectedId(id);
                          setError(undefined);
                        }}
                      />
                    );
                  })}
                </fieldset>
              )}
              <Text size="sm" tone="muted">
                Bara sparade formulär visas. Ett utkast måste sparas under Formulär innan det kan kopplas.
              </Text>
            </>
          )}
        </section>

        <section aria-labelledby="publish-heading" className={styles.part}>
          <h3 id="publish-heading" className={styles.heading}>
            2. När ska formuläret publiceras?
          </h3>
          <fieldset className={styles.when} aria-labelledby="publish-heading">
            <RadioCard
              name="publishWhen"
              value="now"
              title="Publicera nu"
              description="De anställda kan svara på formuläret direkt."
              checked={when === 'now'}
              onChange={() => setWhen('now')}
            />
            <RadioCard
              name="publishWhen"
              value="later"
              title="Publicera senare"
              description="Formuläret kopplas som utkast. Du publicerar det när du vill."
              checked={when === 'later'}
              onChange={() => setWhen('later')}
            />
          </fieldset>
          {when === 'now' && (
            <Text size="sm" tone="muted">
              {employeeCount} anställda kan svara på formuläret.
            </Text>
          )}
        </section>
      </div>
    </Modal>
  );
}

export default ConnectFormModal;
